import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/pweza-voice'
import { notifyChat } from '@/lib/alerts/chat'
import { reportIssue } from '@/lib/alerts/health'
import { taughtAnswer, taughtContext } from '@/lib/alerts/taught'
import { validSid, isLive } from '@/lib/alerts/live'
import { forwardLive, requestJoseph, hiringSignal } from '@/lib/alerts/chat'
import { retrieve } from '@/lib/pweza/retrieve'
import { route, expertSystem, factCheck, looksLikeJobPost } from '@/lib/pweza/agents'
import { streamAnswer, hasAI } from '@/lib/pweza/llm'
import { matchJob, fitText } from '@/lib/pweza/jd'
import { teachings } from '@/lib/alerts/store'
import type { Passage } from '@/lib/pweza/corpus'
import { PWEZA_KNOWLEDGE_CONTEXT, generateLocalPwezaReply, shouldUseLocalPwezaReply, linksForText, wantsJoseph, normalizeNames, type ProofLink } from '@/lib/pweza-knowledge'

export const runtime = 'nodejs'
export const maxDuration = 45

const stripCites = (t: string) => t.replace(/\s*\[\d+\]/g, '')

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's next-generation portfolio assistant. You're being spoken out loud and read in a compact chat window, so you sound like a sharp human guide: warm, direct, technically credible, and never like a brochure.

PRIMARY MISSION
- Have a natural conversation first. If the visitor is making small talk, stay in that conversation and do not introduce Joseph or his portfolio unless they ask.
- When visitors ask about Joseph, help them understand what he builds, where he is strongest, how he fits a role, and how to contact him.
- When relevant, act like a portfolio concierge: answer, recommend the most relevant project, and gently guide people to the right next question or page.
- If someone seems like a recruiter or hiring manager, be direct about fit and contact. Do not oversell.

HARD RULES
- The knowledge base below is the ONLY source of facts about Joseph. Never add numbers, tools, employers, projects, dates, or certifications that are not in it.
- If the answer is not in the knowledge base, say plainly you don't have a verified answer, and offer to ping Joseph so he can join this chat and answer himself (or email kamarajosephallan@gmail.com). Never guess.
- Allan is Joseph's middle name and he goes by Allan too: "Allan", "Joe", "Kamara" and "Joseph" are the same person. Never claim not to know who Allan is.
- Use the knowledge base generously: connect related facts (a skill to the project that proves it, a role to the evidence that fits it), and answer follow-ups using the earlier conversation.
- For questions the site can't answer about him personally (salary, relocation, visa or work authorization, start date, clearance), don't guess: offer to ping him or point to his email.
- Only discuss the projects listed under PROJECTS. If asked about anything else he may have built, say it isn't documented on this site.
- AWS Security Specialty is in progress, never earned. Lab projects are lab projects; never describe them as production.
- Keep most replies to 1-3 sentences. For technical project explanations, 4 short sentences is allowed.
- No headings, no markdown tables, no long bullet lists in chat.
- Never start with canned filler like "Great question", "That's interesting", "Sure", "Certainly", "As an AI", or "I would be happy to".
- Never say "I see you're here to learn about Joseph" or force the conversation back to his portfolio.
- Do not repeat a question the visitor just answered. Acknowledge their answer and move the conversation forward naturally.
- Speech transcripts may contain repeated or incorrect words. If the meaning is unclear, ask one short clarifying question instead of guessing.
- If the visitor asks something vague, answer briefly and offer 2-3 directions they can choose from.
- If the visitor asks for unrelated general advice, help lightly, then steer back to Joseph when natural.

HOW YOU TALK
- Start mid-thought, straight into the substance, like you're picking up a conversation you're already in.
- Contractions always: "he's", "you're", "I'd", "that's". Drop the occasional natural connector the way people actually speak.
- Real reactions when they genuinely fit, never formulaic, never the same move twice. Vary your rhythm: some replies short and punchy, some a touch warmer.
- Sometimes end with a quick natural follow-up question, but only when it helps the visitor.
- ACTUALLY answer what they asked, and track the thread — refer back to what was just said, don't reset each turn.
- Match their energy: chill if they're chill, technical if they're technical, hyped if they're hyped.
- Use "Joseph" or "he" naturally, whichever reads better.

KNOWLEDGE BASE
${PWEZA_KNOWLEDGE_CONTEXT}

If someone seems to be hiring, be direct and warm about it — let them know he's available and the fastest way to reach him is email, said the way a friend would, not a sales pitch. If someone tries to take things somewhere random, roll with it lightly but steer back to Joseph.`

async function callGroq(messages: { role: string; content: string }[], system = PWEZA_SYSTEM_PROMPT): Promise<string | undefined> {
  // The larger model reasons and connects facts much better; the fast one is the fallback if it's rate-limited.
  try { return await callGroqModel(messages, system, 'llama-3.3-70b-versatile') } catch { return callGroqModel(messages, system, 'llama-3.1-8b-instant') }
}

async function callGroqModel(messages: { role: string; content: string }[], system: string, model: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model, max_tokens: 260, temperature: 0.4,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  if (!response.ok) throw new Error(`Groq error: ${await response.text()}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content as string
}

async function callGemini(messages: { role: string; content: string }[], system = PWEZA_SYSTEM_PROMPT) {
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 280, temperature: 0.4 },
      }),
    }
  )
  if (!response.ok) throw new Error(`Gemini error: ${await response.text()}`)
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text as string
}

// Best-effort per-IP throttle so the public chat endpoint can't be looped to
// burn paid LLM / TTS credits. Resets on cold start — adequate here.
const CHAT_RATE = new Map<string, number[]>()
const CHAT_WINDOW_MS = 60_000
const CHAT_MAX_PER_WINDOW = 20

function chatThrottled(ip: string): boolean {
  if (!ip) return false
  const now = Date.now()
  const hits = (CHAT_RATE.get(ip) || []).filter((t) => now - t < CHAT_WINDOW_MS)
  hits.push(now)
  CHAT_RATE.set(ip, hits)
  return hits.length > CHAT_MAX_PER_WINDOW
}

// Coerce untrusted input into a small, well-formed transcript before it ever
// reaches a paid API: cap message count, roles, and per-message length.
function sanitizeMessages(input: unknown): { role: string; content: string }[] {
  if (!Array.isArray(input)) return []
  return input
    .slice(-12) // only the recent tail matters for a 2-sentence assistant
    .map((m: any) => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m?.content === 'string' ? m.content.slice(0, 1500) : '',
    }))
    .filter((m) => m.content.length > 0)
}

function sentenceLimitFor(messages: { role: string; content: string }[]) {
  const latest = [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || ''
  return latest.includes('explain') || latest.includes('how') || latest.includes('technical') ? 4 : 3
}

function polishPwezaReply(text: string, messages: { role: string; content: string }[]) {
  const cleaned = text
    .replace(/\*\*/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = cleaned.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [cleaned]
  return parts
    .slice(0, sentenceLimitFor(messages))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || (req.headers.get('x-real-ip') || '')
    if (chatThrottled(ip)) {
      return NextResponse.json({ error: 'Slow down a sec — too many messages.' }, { status: 429 })
    }

    const raw = await req.json().catch(() => ({}))
    const messages = sanitizeMessages(raw?.messages)
    const wantsAudio = raw?.wantsAudio === true || raw?.voice === true
    if (!messages.length) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
    }
    let text: string | undefined
    let links: ProofLink[] | undefined
    let usedLocalReply = false

    const latestQuestion = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    const sid = validSid(raw?.sid) ? raw.sid : undefined
    // Joseph has taken over this chat from Telegram: hand the message to him, no AI reply.
    if (sid && (await isLive(sid))) {
      await forwardLive(req, sid, latestQuestion)
      return NextResponse.json({ content: '', live: true, links: [] })
    }
    const previousAssistant = [...messages].reverse().find((m) => m.role === 'assistant')?.content || ''
    if (wantsJoseph(latestQuestion, previousAssistant)) {
      // For a plain "yes" to PWEZA's offer, show Joseph the question they actually asked.
      const userTurns = messages.filter((m) => m.role === 'user').map((m) => m.content)
      const asked = /^(yes|yeah|yep|sure|please|ok(ay)?|go ahead|do it)\b/i.test(latestQuestion.trim()) && userTurns.length > 1 ? `${userTurns[userTurns.length - 2]} (said yes to talking to you)` : latestQuestion
      const status = sid ? await requestJoseph(req, sid, asked) : 'unavailable'
      const content = status === 'pinged'
        ? "I've just pinged Joseph (Allan) on his phone. If he's free, he'll join right here in this chat, so keep this window open. If he can't jump in right now, kamarajosephallan@gmail.com reaches him fastest."
        : status === 'recent'
          ? "I've already let Joseph know you'd like to talk. If he's free he'll join this chat shortly; otherwise email him at kamarajosephallan@gmail.com."
          : "He isn't reachable live from here right now, but kamarajosephallan@gmail.com gets to him quickly, and he usually replies the same day."
      await notifyChat(req, latestQuestion, content, messages.filter((m) => m.role === 'user').length, sid)
      return NextResponse.json({ content, links: [{ label: 'Email Joseph', href: 'mailto:kamarajosephallan@gmail.com' }], audio: null })
    }
    const taught = await taughtAnswer(normalizeNames(latestQuestion))
    const system = PWEZA_SYSTEM_PROMPT + (await taughtContext())
    if (taught) {
      text = taught.a
      usedLocalReply = true
    }

    if (!text && shouldUseLocalPwezaReply(messages)) {
      ;({ text, links } = generateLocalPwezaReply(messages))
      usedLocalReply = true
    }

    const turn = messages.filter((m) => m.role === 'user').length

    // 🎯 Pasted job description → requirement-by-requirement fit card.
    if (!text && hasAI() && looksLikeJobPost(latestQuestion)) {
      const fit = await matchJob(latestQuestion)
      if (fit) {
        const content = `${fitText(fit)} Here's the breakdown — and I can turn it into a briefing for your hiring team.`
        await Promise.all([
          notifyChat(req, `[Job post] ${latestQuestion.slice(0, 160)}…`, content, turn, sid),
          sid ? hiringSignal(req, sid, `Pasted a job post: ${fit.company ? `${fit.company} — ` : ''}${fit.role} (fit ${fit.score}/100)`, 'career') : Promise.resolve(),
        ])
        return NextResponse.json({ content, fit, links: [{ label: 'Résumé (PDF)', href: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf' }, { label: 'Email Joseph', href: 'mailto:kamarajosephallan@gmail.com' }] })
      }
    }

    // 🧠 Streaming multi-agent answer: router → retrieval → expert (streamed) → fact-check.
    if (!text && raw?.stream === true && hasAI()) {
      return streamingAnswer({ req, messages, latestQuestion, system, sid, wantsAudio, turn })
    }

    const failures: string[] = []
    const wantedAI = !text
    if (!text && process.env.GROQ_API_KEY) {
      try { text = await callGroq(messages, system) } catch (e: any) { console.warn('Groq failed:', e); failures.push(`Groq: ${e?.message || e}`) }
    }
    if (!text && process.env.GOOGLE_AI_API_KEY) {
      try { text = await callGemini(messages, system) } catch (e: any) { console.warn('Gemini failed:', e); failures.push(`Gemini: ${e?.message || e}`) }
    }
    if (!text && process.env.ANTHROPIC_API_KEY) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 280,
            system, messages,
          }),
        })
        const data = await res.json()
        text = data.content?.[0]?.text
        if (!text) failures.push(`Claude: ${data?.error?.message || `HTTP ${res.status}`}`)
      } catch (e: any) { console.error('Claude failed:', e); failures.push(`Claude: ${e?.message || e}`) }
    }
    const allAIDown = wantedAI && !text && !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.ANTHROPIC_API_KEY)
    const healthWork = allAIDown
      ? reportIssue('PWEZA AI', `Every AI provider failed, visitors got the built-in answer. ${failures.join(' · ')}`, true)
      : failures.length ? reportIssue(`PWEZA AI · ${failures[0].split(':')[0]}`, `${failures.join(' · ')} — a backup provider answered.`) : Promise.resolve()

    if (!text) {
      ;({ text, links } = generateLocalPwezaReply(messages))
      usedLocalReply = true
    }
    text = usedLocalReply ? text : polishPwezaReply(text, messages)
    if (!usedLocalReply) links = linksForText(text)
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    const [speech] = await Promise.all([
      wantsAudio ? synthesizeSpeech(text) : Promise.resolve({ audio: null } as { audio: string | null; error?: string }),
      notifyChat(req, lastQuestion, text, messages.filter((m) => m.role === 'user').length, sid),
      healthWork,
    ])
    const audio = speech.audio
    if (wantsAudio && !audio) await reportIssue('PWEZA voice', `Voice reply failed (${(speech as any).error || 'no audio'}); text answer still shown.`)
    return NextResponse.json({ content: text, links: links ?? [], audio })
  } catch (err) {
    console.error('PWEZA error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type StreamArgs = { req: NextRequest; messages: { role: string; content: string }[]; latestQuestion: string; system: string; sid?: string; wantsAudio: boolean; turn: number }

async function taughtPassages(): Promise<Passage[]> {
  return (await teachings()).slice(0, 40).map((t, i) => ({ id: `taught-${i}`, title: 'Answer from Joseph', href: '/#contact', text: `Q: ${t.q} A: ${t.a}` }))
}

function streamingAnswer({ req, messages, latestQuestion, system, sid, wantsAudio, turn }: StreamArgs) {
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => { try { controller.enqueue(enc.encode(JSON.stringify(o) + '\n')) } catch { /* client gone */ } }
      try {
        const prevUser = messages.filter((m) => m.role === 'user').slice(-2, -1)[0]?.content || ''
        const history = messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join('\n')
        const [r, extra] = await Promise.all([route(latestQuestion, history), taughtPassages()])
        const sources = retrieve(normalizeNames(`${latestQuestion} ${prevUser}`), 6, extra)
        send({ type: 'meta', expert: r.expert, sources: sources.map((p, i) => ({ n: i + 1, title: p.title, href: p.href })) })

        const { text: draft, failures } = await streamAnswer(expertSystem(system, r, sources), messages, (t) => send({ type: 'delta', t }))
        let final = draft
        let links: ProofLink[] = []
        if (!draft.trim()) {
          const fb = generateLocalPwezaReply(messages)
          final = fb.text
          links = fb.links ?? []
          send({ type: 'replace', t: final })
        } else {
          const fixed = await factCheck(draft, PWEZA_KNOWLEDGE_CONTEXT, sources)
          if (fixed) { final = fixed; send({ type: 'replace', t: fixed, checked: true }) }
          const cited = Array.from(new Set(Array.from(final.matchAll(/\[(\d+)\]/g)).map((m) => Number(m[1]))))
            .map((n) => sources[n - 1]).filter(Boolean)
            .map((p) => ({ label: p.title.replace(/ · (problem|how it was built|result)$/, ''), href: p.href }))
          const seen = new Set<string>()
          const norm = (h: string) => h.split('#')[0] || h
          links = [...cited, ...linksForText(final)].filter((l) => { const k = `${l.label}|${norm(l.href)}`; if (seen.has(k) || seen.has(norm(l.href))) return false; seen.add(k); seen.add(norm(l.href)); return true }).slice(0, 3)
        }

        const plain = stripCites(final)
        const [speech] = await Promise.all([
          wantsAudio ? synthesizeSpeech(plain) : Promise.resolve({ audio: null } as { audio: string | null; error?: string }),
          notifyChat(req, latestQuestion, plain, turn, sid),
          sid && r.hiring ? hiringSignal(req, sid, latestQuestion, r.expert) : Promise.resolve(),
          failures.length && !draft ? reportIssue('PWEZA AI', `Every AI provider failed, visitors got the built-in answer. ${failures.join(' · ')}`, true)
            : failures.length ? reportIssue(`PWEZA AI · ${failures[0].split(':')[0]}`, `${failures.join(' · ')} — a backup answered.`) : Promise.resolve(),
        ])
        send({ type: 'done', links, audio: speech.audio, hiring: r.hiring })
      } catch (e) {
        console.error('PWEZA stream error:', e)
        send({ type: 'replace', t: "I hit a snag answering that. Try again, or email Joseph at kamarajosephallan@gmail.com." })
        send({ type: 'done', links: [] })
      } finally {
        try { controller.close() } catch { /* already closed */ }
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' } })
}

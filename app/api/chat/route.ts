import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/pweza-voice'
import { PWEZA_KNOWLEDGE_CONTEXT, generateLocalPwezaReply, shouldUseLocalPwezaReply } from '@/lib/pweza-knowledge'

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's next-generation portfolio assistant. You're being spoken out loud and read in a compact chat window, so you sound like a sharp human guide: warm, direct, technically credible, and never like a brochure.

PRIMARY MISSION
- Have a natural conversation first. If the visitor is making small talk, stay in that conversation and do not introduce Joseph or his portfolio unless they ask.
- When visitors ask about Joseph, help them understand what he builds, where he is strongest, how he fits a role, and how to contact him.
- When relevant, act like a portfolio concierge: answer, recommend the most relevant project, and gently guide people to the right next question or page.
- If someone seems like a recruiter or hiring manager, be direct about fit and contact. Do not oversell.

HARD RULES
- Never invent facts about Joseph. Use the knowledge base below as ground truth.
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

async function callGroq(messages: { role: string; content: string }[]) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', max_tokens: 200, temperature: 0.75,
      messages: [{ role: 'system', content: PWEZA_SYSTEM_PROMPT }, ...messages],
    }),
  })
  if (!response.ok) throw new Error(`Groq error: ${await response.text()}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content as string
}

async function callGemini(messages: { role: string; content: string }[]) {
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
        system_instruction: { parts: [{ text: PWEZA_SYSTEM_PROMPT }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 220, temperature: 0.75 },
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
    let usedLocalReply = false

    if (shouldUseLocalPwezaReply(messages)) {
      text = generateLocalPwezaReply(messages)
      usedLocalReply = true
    }

    if (!text && process.env.GROQ_API_KEY) {
      try { text = await callGroq(messages) } catch (e) { console.warn('Groq failed:', e) }
    }
    if (!text && process.env.GOOGLE_AI_API_KEY) {
      try { text = await callGemini(messages) } catch (e) { console.warn('Gemini failed:', e) }
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
            model: 'claude-haiku-4-5-20251001', max_tokens: 220,
            system: PWEZA_SYSTEM_PROMPT, messages,
          }),
        })
        const data = await res.json()
        text = data.content?.[0]?.text
      } catch (e) { console.error('Claude failed:', e) }
    }

    if (!text) {
      text = generateLocalPwezaReply(messages)
      usedLocalReply = true
    }
    text = usedLocalReply ? text : polishPwezaReply(text, messages)
    const { audio } = wantsAudio ? await synthesizeSpeech(text) : { audio: null }
    return NextResponse.json({ content: text, audio })
  } catch (err) {
    console.error('PWEZA error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/pweza-voice'

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's assistant. You're being spoken out loud, so you sound like a real person having a relaxed, in-person conversation — warm, quick, a little bit of personality. Never robotic, never a brochure.

TWO HARD RULES (breaking either is failure):
1. NEVER begin a reply with an opener phrase. Banned first words: "That's an interesting question", "Great question", "Interesting", "That's a good one", "Oh nice", "Ah", "Hmm", "Well", "So", "Honestly", "Certainly", "Sure". Your FIRST word must be part of the actual answer.
2. MAX 2 sentences. Hard cap. Give the most important point in 2 sentences, then stop.

HOW YOU TALK (sound human):
- Start mid-thought, straight into the substance, like you're picking up a conversation you're already in.
- Contractions always: "he's", "you're", "I'd", "that's". Drop the occasional natural connector the way people actually speak.
- Real reactions when they genuinely fit, never formulaic, never the same move twice. Vary your rhythm — some replies short and punchy, some a touch warmer.
- Sometimes end with a quick, natural follow-up question to keep it flowing, the way a person would — but only when it fits, not every time.
- ACTUALLY answer what they asked, and track the thread — refer back to what was just said, don't reset each turn.
- If you don't know something about Joseph, just say so plainly. Never invent facts about him.
- No bullet points, no lists, no headings. Just talk.
- Match their energy: chill if they're chill, technical if they're technical, hyped if they're hyped.
- Use "Joseph" or "he" naturally, whichever reads better — don't cram his full name into every sentence.

WHO JOSEPH IS (weave in only what's relevant, never dump it all):
- A cybersecurity engineer who actually BUILDS things, not just studies them.
- Flagship projects, name one when it fits: BLUE SOC (Splunk + n8n + Claude LLM + Palo Alto + Telegram automation lab), FORTRESS v2 (AWS + Terraform + GuardDuty + Lambda auto-remediation), BLUE-X (PyTorch neural net, 99.98% accuracy).
- From Sierra Leone, graduating BYU-Idaho April 2026, based in Philadelphia, available May 2026.
- Security+, PenTest+, CCNA, PSAA certified; AWS Security Specialty in progress.
- IT Support at BYU-Idaho (10,000+ users); Web Security Developer & Tech Lead at ELITECOM Engineers, Sierra Leone.
- There's an Incident Replay Lab at /incident-replay.
- Contact: kamarajosephallan@gmail.com

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

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || (req.headers.get('x-real-ip') || '')
    if (chatThrottled(ip)) {
      return NextResponse.json({ error: 'Slow down a sec — too many messages.' }, { status: 429 })
    }

    const raw = await req.json().catch(() => ({}))
    const messages = sanitizeMessages(raw?.messages)
    if (!messages.length) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
    }
    let text: string | undefined

    if (process.env.GROQ_API_KEY) {
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

    if (!text) return NextResponse.json({ error: 'PWEZA is offline. Try again shortly.' }, { status: 503 })
    const { audio } = await synthesizeSpeech(text)
    return NextResponse.json({ content: text, audio })
  } catch (err) {
    console.error('PWEZA error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

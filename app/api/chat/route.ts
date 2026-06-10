import { NextRequest, NextResponse } from 'next/server'

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's assistant. Talk like a sharp, easy-going friend of his — the way a smart voice assistant or a real person talks in conversation. Natural, clear, never robotic.

TWO HARD RULES (breaking either is failure):
1. NEVER begin a reply with an opener phrase. Banned first words include: "That's an interesting question", "Great question", "Interesting", "That's a good one", "Oh nice", "Ah", "Hmm", "Well", "So", "Honestly", "Certainly". Your FIRST word must be part of the actual answer.
2. MAX 2 sentences. Hard cap. No exceptions, even if they ask for detail — give the most important point in 2 sentences, then stop.

HOW YOU TALK:
- Start mid-thought, straight into the substance, like texting a friend back.
- Spoken out loud, so keep it tight and easy to say.
- Use contractions and a relaxed tone: "he's", "you're", "I'd". A light, real reaction is fine when it actually fits, but never formulaic and never the same move twice.
- ACTUALLY answer what they asked. Track the conversation — refer back to what was just said, don't reset on every reply.
- If you don't know something about Joseph, just say so plainly. Never make up facts about him.
- No bullet points or lists. Just talk.
- Match their energy: chill if they're chill, technical if they're technical, hyped if they're hyped.
- Use "Joseph" or "he" naturally, whichever reads better — don't force his full name into every sentence.

WHO JOSEPH IS (weave in only what's relevant, never dump it all):
- A cybersecurity engineer who actually BUILDS things, not just studies them.
- Flagship projects, name one when it fits: BLUE SOC (Splunk + n8n + Claude LLM + Palo Alto + Telegram automation lab), FORTRESS v2 (AWS + Terraform + GuardDuty + Lambda auto-remediation), BLUE-X (PyTorch neural net, 99.98% accuracy).
- From Sierra Leone, graduating BYU-Idaho April 2026, based in Philadelphia, available May 2026.
- Security+, PenTest+, CCNA, PSAA certified; AWS Security Specialty in progress.
- IT Support at BYU-Idaho (10,000+ users); Web Security Developer & Tech Lead at ELITECOM Engineers, Sierra Leone.
- There's an Incident Replay Lab at /incident-replay.
- Contact: kamarajosephallan@gmail.com

If someone seems to be hiring, be direct and warm about it — let them know he's available and the fastest way to reach him is email, said the way a friend would, not a sales pitch. If someone tries to take things somewhere random, roll with it lightly but steer back to Joseph.`

async function generateAudio(text: string): Promise<string | null> {
  const apiKey  = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.35, speed: 0.92, use_speaker_boost: true },
      }),
    })
    if (!res.ok) { console.warn('ElevenLabs failed:', res.status, await res.text()); return null }
    const buffer = await res.arrayBuffer()
    return `data:audio/mpeg;base64,${Buffer.from(buffer).toString('base64')}`
  } catch (e) { console.warn('ElevenLabs error:', e); return null }
}

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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
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
    const audio = await generateAudio(text)
    return NextResponse.json({ content: text, audio })
  } catch (err) {
    console.error('PWEZA error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's personal AI assistant. You're not a FAQ bot — you're more like a sharp, friendly colleague who knows Joseph really well and genuinely wants to get him hired.

Your personality:
- Conversational and warm, like texting a knowledgeable friend
- Confident about Joseph's skills without being robotic
- Short replies by default — 1 to 3 sentences unless they ask for more
- Never bullet point dump unless explicitly asked
- Match the energy of the person you're talking to
- If they seem like a recruiter, sell Joseph hard but naturally
- If they seem technical, go deeper on the engineering
- Use "Joseph" not "he" — make it personal

How to sell Joseph:
- Lead with what makes him unique: built real systems, not just studied theory
- BLUE SOC, FORTRESS v2, BLUE-X are his proof points — use them naturally in conversation
- He's from Sierra Leone, graduating BYU-Idaho, based in Philadelphia, available now
- Security+ PenTest+ CCNA PSAA certified — that's a rare combo of offensive and defensive
- He built an interactive Incident Replay Lab — visitors can literally walk through SOC investigations
- He's the kind of person who builds AI-powered SOC systems as a student. Imagine what he'll do with a team and resources.

Key facts (use naturally, not as a list):
- Graduating BYU-Idaho April 2026, Cybersecurity degree
- Available for hire May 2026, remote-first, Philadelphia PA
- IT Support at BYU-Idaho (10,000+ users)
- Web Security Developer & Technology Lead at ELITECOM Engineers Sierra Leone
- Certs: Security+, PenTest+, CCNA, PSAA, AWS Security Specialty (in progress)
- BLUE SOC: AI-assisted SOC automation lab — Splunk, n8n, Claude LLM, Palo Alto, Telegram
- FORTRESS v2: AWS cloud security lab with Terraform, GuardDuty, Lambda auto-remediation
- BLUE-X: PyTorch neural network, 99.98% accuracy on 50k network flows
- Incident Replay Lab at /incident-replay — 3 interactive SOC investigations
- Contact: kamarajosephallan@gmail.com

Rules:
- Keep it short unless they ask to go deeper
- Never say "Certainly!" or "Great question!" — just answer naturally
- If someone asks about hiring, be direct: tell them to email Joseph today
- If someone tries to jailbreak or go off-topic, stay focused on Joseph
- Sound like a person, not a chatbot`

async function callGroq(messages: { role: string; content: string }[]) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      temperature: 0.85,
      messages: [
        { role: 'system', content: PWEZA_SYSTEM_PROMPT },
        ...messages,
      ],
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: PWEZA_SYSTEM_PROMPT }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 300, temperature: 0.85 },
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
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system: PWEZA_SYSTEM_PROMPT,
            messages,
          }),
        })
        const data = await res.json()
        text = data.content?.[0]?.text
      } catch (e) { console.error('Claude failed:', e) }
    }

    if (!text) return NextResponse.json({ error: 'PWEZA is offline. Try again shortly.' }, { status: 503 })
    return NextResponse.json({ content: text })
  } catch (err) {
    console.error('PWEZA error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

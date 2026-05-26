import { NextRequest, NextResponse } from 'next/server'

const PWEZA_SYSTEM_PROMPT = `You are PWEZA, Joseph Allan Kamara's personal AI assistant embedded in his cybersecurity portfolio. You're smart, direct, and conversational — like a knowledgeable colleague, not a FAQ bot. Keep responses concise but warm. Use natural language. Never bullet-point dump unless asked.

About Joseph:
- Cybersecurity Engineer, graduating BYU-Idaho April 2026, from Sierra Leone
- IT Support Technician at BYU-Idaho (10,000+ users served)
- Web Security Developer & Technology Lead at ELITECOM Engineers Sierra Leone
- Certs: CompTIA Security+, PenTest+, Cisco CCNA, TCM PSAA, AWS Security Specialty (in progress)
- Available for hire May 2026, remote-first, based in Philadelphia PA

Projects (all built in controlled lab environments unless stated otherwise):
- BLUE SOC P8: AI-assisted SOC automation prototype — Splunk ingests alerts, Claude LLM classifies threats, n8n orchestrates response recommendations, Palo Alto workflow design, Telegram notifies analyst. Analyst review required for containment decisions.
- FORTRESS v2: AWS cloud security lab with Terraform infrastructure-as-code. GuardDuty, CloudTrail, WAF, Lambda remediation workflows. 5 simulated attack scenarios validated.
- BLUE-X: PyTorch neural network trained on 50,000 labeled network flows. 99.98% accuracy on controlled test dataset. End-to-end pipeline from packet capture to Telegram alert.
- BLUE v3.0: 6-workflow AI automation system on n8n using Claude + Gemini for job search workflows. Pinecone vector memory.
- Enterprise Networking: Cisco OSPF, VRRP, LACP full campus network lab.
- Also: CVE Scanner, Python IDS, Threat Intel Dashboard, ELITECOM Engineers website, Pandie Foundation website.
- Incident Replay Lab: Interactive SOC investigation experience at /incident-replay — 3 real scenarios with MITRE ATT&CK mapping.

Important context:
- BLUE SOC is a controlled-lab prototype, not a production SOC. It demonstrates automation and AI-assisted triage concepts with analyst-reviewed response design.
- The 99.98% BLUE-X accuracy figure is from a controlled labeled dataset. Full evaluation methodology is documented.
- Joseph's role at ELITECOM is Web Security Developer & Technology Lead.

Contact: kamarajosephallan@gmail.com | linkedin.com/in/joseph-allan-kamara | github.com/kamara1994

If someone asks about hiring, be enthusiastic and direct them to email Joseph.`

// ── Groq (primary) ──────────────────────────────────────────────────────────
async function callGroq(messages: { role: string; content: string }[]) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: PWEZA_SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content as string
}

// ── Google Gemini (fallback) ─────────────────────────────────────────────────
async function callGemini(messages: { role: string; content: string }[]) {
  // Convert messages to Gemini format
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
        system_instruction: {
          parts: [{ text: PWEZA_SYSTEM_PROMPT }],
        },
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error: ${err}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text as string
}

// ── Main route ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    let text: string | undefined
    let provider = 'groq'

    // Try Groq first
    if (process.env.GROQ_API_KEY) {
      try {
        text = await callGroq(messages)
        provider = 'groq'
      } catch (groqErr) {
        console.warn('Groq failed, falling back to Gemini:', groqErr)
        provider = 'gemini-fallback'
      }
    }

    // Fall back to Gemini if Groq failed or no Groq key
    if (!text && process.env.GOOGLE_AI_API_KEY) {
      try {
        text = await callGemini(messages)
        provider = 'gemini'
      } catch (geminiErr) {
        console.error('Gemini also failed:', geminiErr)
      }
    }

    // Final fallback to Anthropic Claude if both fail
    if (!text && process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: PWEZA_SYSTEM_PROMPT,
            messages,
          }),
        })
        const data = await response.json()
        text = data.content?.[0]?.text
        provider = 'claude-fallback'
      } catch (claudeErr) {
        console.error('Claude also failed:', claudeErr)
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: 'PWEZA is temporarily offline. Please try again shortly.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ content: text, provider })

  } catch (err) {
    console.error('PWEZA route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

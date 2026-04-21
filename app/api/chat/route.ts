import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

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
        system: `You are JAK-AI, Joseph Allan Kamara's personal AI assistant embedded in his cybersecurity portfolio. You're smart, direct, and conversational — like a knowledgeable colleague, not a FAQ bot. Keep responses concise but warm. Use natural language. Never bullet-point dump unless asked.

About Joseph:
- Cybersecurity Engineer, graduating BYU-Idaho April 2026, from Sierra Leone
- IT Support Technician at BYU-Idaho (10,000+ users served)
- CISO at ELITECOM Engineers Sierra Leone
- Certs: CompTIA Security+, PenTest+, Cisco CCNA, TCM PSAA, AWS Security Specialty (65% done)
- Available for hire May 2026, remote-first, based in Philadelphia PA

Projects:
- BLUE SOC: Autonomous AI security operations center — Splunk detects threats, Claude analyzes, Palo Alto auto-blocks, Telegram alerts
- FORTRESS v2: AWS cloud security lab with Terraform, 5 live attack simulations
- BLUE-X: PyTorch threat classifier, 99.98% accuracy
- BLUE v3.0: 6-workflow autonomous job hunting OS on n8n + React dashboard
- Enterprise Networking: Cisco OSPF, VRRP, LACP full campus network
- Also: CVE Scanner, Python IDS, Threat Intel Dashboard, ELITECOM Engineers website

Contact: kamarajosephallan@gmail.com | linkedin.com/in/joseph-allan-kamara | github.com/kamara1994

If someone asks about hiring, be enthusiastic and direct them to email Joseph.`,
        messages,
      }),
    })

    const data = await response.json()

    if (data.type === 'error') {
      console.error('Anthropic API error:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const text = data.content?.[0]?.text
    if (!text) {
      console.error('Unexpected response:', JSON.stringify(data))
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 })
    }

    return NextResponse.json({ content: text })

  } catch (err) {
    console.error('JAK-AI route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
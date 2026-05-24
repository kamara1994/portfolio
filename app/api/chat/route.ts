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

Important context:
- BLUE SOC is a controlled-lab prototype, not a production SOC. It demonstrates automation and AI-assisted triage concepts with analyst-reviewed response design.
- The 99.98% BLUE-X accuracy figure is from a controlled labeled dataset. Full evaluation methodology is documented.
- Joseph's role at ELITECOM is Web Security Developer & Technology Lead, not CISO.

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

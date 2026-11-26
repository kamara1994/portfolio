// Two-sentence AI read of a visit, written only from the recorded facts.
// Tries the same providers PWEZA uses; falls back to a plain summary.

const SYSTEM = `You write a 2-sentence private note to Joseph (a cybersecurity job seeker) about one visit to his portfolio site.
Use ONLY the facts given. Never invent names, titles, employers or intent beyond what the facts support; say "likely" when inferring.
Sentence 1: who this probably is and what they focused on. Sentence 2: one concrete, useful follow-up suggestion (or "No action needed" for a low-signal visit).
Max 45 words total. Plain text, no emojis, no markdown.`

async function anthropic(prompt: string) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 120, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(7000),
  })
  const d = await r.json()
  return d.content?.[0]?.text as string | undefined
}

async function groq(prompt: string) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', max_tokens: 120, temperature: 0.2, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(7000),
  })
  const d = await r.json()
  return d.choices?.[0]?.message?.content as string | undefined
}

async function gemini(prompt: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 120, temperature: 0.2 } }),
    signal: AbortSignal.timeout(7000),
  })
  const d = await r.json()
  return d.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
}

export async function aiBrief(facts: Record<string, unknown>): Promise<string> {
  const prompt = `Facts about the visit (JSON):\n${JSON.stringify(facts)}`
  const tries: [string | undefined, (p: string) => Promise<string | undefined>][] = [
    [process.env.ANTHROPIC_API_KEY, anthropic],
    [process.env.GROQ_API_KEY, groq],
    [process.env.GOOGLE_AI_API_KEY, gemini],
  ]
  for (const [key, fn] of tries) {
    if (!key) continue
    try {
      const t = (await fn(prompt))?.replace(/\s+/g, ' ').trim()
      if (t) return t.slice(0, 400)
    } catch { /* try next provider */ }
  }
  return ''
}

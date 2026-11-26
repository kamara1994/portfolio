// Model calls for PWEZA's agents: streaming answers and structured (JSON) agent outputs,
// with provider fallback Groq → Gemini → Claude.

type Msg = { role: string; content: string }
const GROQ = `${process.env.PWEZA_GROQ_BASE || 'https://api.groq.com'}/openai/v1/chat/completions`
export const BIG = 'llama-3.3-70b-versatile'
export const FAST = 'llama-3.1-8b-instant'

async function groqStream(model: string, system: string, messages: Msg[], maxTokens: number, onDelta: (t: string) => void): Promise<string> {
  const res = await fetch(GROQ, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model, stream: true, max_tokens: maxTokens, temperature: 0.4, messages: [{ role: 'system', content: system }, ...messages] }),
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok || !res.body) throw new Error(`Groq ${model} HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 160)}`)
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      const l = line.trim()
      if (!l.startsWith('data:')) continue
      const data = l.slice(5).trim()
      if (data === '[DONE]') continue
      try {
        const t = JSON.parse(data).choices?.[0]?.delta?.content
        if (t) { full += t; onDelta(t) }
      } catch { /* partial line */ }
    }
  }
  if (!full.trim()) throw new Error(`Groq ${model} returned no text`)
  return full
}

async function gemini(system: string, messages: Msg[], maxTokens: number, json = false): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
    signal: AbortSignal.timeout(20000),
  })
  const d = await res.json()
  const t = d.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') as string | undefined
  if (!t) throw new Error(`Gemini: ${d.error?.message || `HTTP ${res.status}`}`)
  return t
}

async function claude(system: string, messages: Msg[], maxTokens: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system, messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })) }),
    signal: AbortSignal.timeout(20000),
  })
  const d = await res.json()
  const t = d.content?.[0]?.text as string | undefined
  if (!t) throw new Error(`Claude: ${d.error?.message || `HTTP ${res.status}`}`)
  return t
}

/** Streams the answer through `onDelta`. Returns the full text and the provider failures seen. */
export async function streamAnswer(system: string, messages: Msg[], onDelta: (t: string) => void, maxTokens = 320) {
  const failures: string[] = []
  if (process.env.GROQ_API_KEY) {
    for (const model of [BIG, FAST]) {
      let sent = false
      try { return { text: await groqStream(model, system, messages, maxTokens, (t) => { sent = true; onDelta(t) }), failures } }
      catch (e: any) { failures.push(e?.message || String(e)); if (sent) return { text: '', failures, partial: true } }
    }
  }
  for (const [key, fn, name] of [[process.env.GOOGLE_AI_API_KEY, gemini, 'Gemini'], [process.env.ANTHROPIC_API_KEY, claude, 'Claude']] as const) {
    if (!key) continue
    try { const t = await fn(system, messages, maxTokens); onDelta(t); return { text: t, failures } }
    catch (e: any) { failures.push(`${name}: ${e?.message || e}`) }
  }
  return { text: '', failures }
}

/** A JSON-returning agent call (router, fact-checker, job matcher). Returns null on any failure. */
export async function agentJSON<T>(system: string, user: string, opts: { model?: string; maxTokens?: number; timeoutMs?: number } = {}): Promise<T | null> {
  const maxTokens = opts.maxTokens ?? 400
  const parse = (t: string) => { try { return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)) as T } catch { return null } }
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch(GROQ, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: opts.model ?? FAST, max_tokens: maxTokens, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 6000),
      })
      if (res.ok) { const r = parse((await res.json()).choices?.[0]?.message?.content || ''); if (r) return r }
    } catch { /* fall through */ }
  }
  if (process.env.GOOGLE_AI_API_KEY) {
    try { const r = parse(await gemini(system, [{ role: 'user', content: user }], maxTokens, true)); if (r) return r } catch { /* fall through */ }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try { const r = parse(await claude(`${system}\nRespond with JSON only.`, [{ role: 'user', content: user }], maxTokens)); if (r) return r } catch { /* give up */ }
  }
  return null
}

export const hasAI = () => !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.ANTHROPIC_API_KEY)

import { safe } from '@/lib/alerts/store'
import { ask } from '@/lib/alerts/brief'

// 🔎 Company intel with Tavily: who is this employer, what do they do in security, what's new,
// and how Joseph should pitch himself. Cached for a week per company.

export const searchConfigured = () => !!process.env.TAVILY_API_KEY

type Hit = { title: string; url: string; content: string }

export async function webSearch(query: string, max = 6): Promise<{ answer: string; results: Hit[] } | null> {
  if (!searchConfigured()) return null
  try {
    const res = await fetch(`${process.env.TAVILY_API_BASE || 'https://api.tavily.com'}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
      body: JSON.stringify({ query, max_results: max, search_depth: 'basic', include_answer: true }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    const d = await res.json()
    return { answer: String(d.answer || ''), results: (d.results || []).map((r: any) => ({ title: String(r.title || ''), url: String(r.url || ''), content: String(r.content || '').slice(0, 600) })) }
  } catch { return null }
}

export type Intel = { company: string; text: string; sources: { title: string; url: string }[] }

export async function companyIntel(company: string): Promise<Intel | null> {
  const name = company.trim().slice(0, 80)
  if (name.length < 2) return null
  const key = `intel:${name.toLowerCase()}`
  const cached = await safe((r) => r.get<Intel>(key), null)
  if (cached) return cached
  const [about, jobs] = await Promise.all([
    webSearch(`${name} company overview cybersecurity`, 5),
    webSearch(`${name} security analyst OR SOC OR cybersecurity jobs hiring`, 4),
  ])
  if (!about && !jobs) return null
  const all = [...(about?.results || []), ...(jobs?.results || [])]
  const notes = [about?.answer, jobs?.answer, ...all.map((h, i) => `[${i + 1}] ${h.title}: ${h.content}`)].filter(Boolean).join('\n').slice(0, 6000)
  const text = await ask(
    'You brief Joseph Allan Kamara, an entry-level cybersecurity candidate (SOC, cloud security, BYU-Idaho Dec 2026, Security+/CCNA/PenTest+/PSAA), on a company that just showed interest in his portfolio. Use ONLY the notes. Plain text, no markdown headings, max 120 words, these labelled lines: What they do: · Security angle: · Hiring signals: · Pitch angle: (one line on which of his strengths to lead with). Say "unknown" rather than guess.',
    `COMPANY: ${name}\nNOTES:\n${notes}`, 320,
  )
  const intel: Intel = { company: name, text: text || (about?.answer || jobs?.answer || '').slice(0, 600), sources: all.slice(0, 4).map(({ title, url }) => ({ title, url })) }
  if (!intel.text) return null
  await safe((r) => r.set(key, intel, { ex: 7 * 86_400 }), null)
  return intel
}

/** Compact Telegram rendering. */
export function renderIntel(i: Intel, esc: (s: string) => string) {
  const src = i.sources.slice(0, 3).map((s) => `• <a href="${esc(s.url)}">${esc(s.title.slice(0, 60) || s.url)}</a>`).join('\n')
  return `🔎 <b>Company intel: ${esc(i.company)}</b>\n\n${esc(i.text)}${src ? `\n\n${src}` : ''}`
}

/** Telegram callback data is limited to 64 bytes. */
export const intelButton = (company: string) => {
  let c = company.replace(/[^\x20-\x7E]/g, '').trim().slice(0, 56)
  return c.length >= 2 ? { text: '🔎 Research company', callback_data: `intel:${c}` } : null
}

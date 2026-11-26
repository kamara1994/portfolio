import { safe } from './store'
import type { Ctx, Live } from './format'

// Self-learning lead score: Joseph taps 👍 / 👎 on alerts; for each signal present in
// rated visits we track how often it led to a 👍. Signals that keep proving useful
// add points; signals that keep appearing in 👎 visits lose points. Needs a few
// ratings per signal before it moves the score.

export const SIGNALS: Record<string, string> = {
  target: 'Known target company',
  link: 'Came through a company link',
  watch: 'On your watchlist',
  jobsite: 'From a job site (LinkedIn, Handshake…)',
  recruiter: 'Chose "Recruiter"',
  long: 'Stayed over 3 minutes',
  deep: 'Viewed 3+ pages',
  project: 'Opened a project',
  resume: 'Opened résumé',
  contact: 'Clicked email / LinkedIn',
  code: 'Viewed source code / evidence',
  returning: 'Returning visitor',
  pweza: 'Asked PWEZA',
}

export function signalsOf(ctx: Ctx, live: Live): string[] {
  const s: string[] = []
  const acts = new Set(live.actions)
  if (ctx.target) s.push('target')
  if (ctx.via) s.push('link')
  if (ctx.watch) s.push('watch')
  if (ctx.ref.kind === 'job') s.push('jobsite')
  if (live.role === 'recruiter') s.push('recruiter')
  if (live.durMs > 180_000) s.push('long')
  if (new Set(live.steps.map((x) => x.p)).size >= 3) s.push('deep')
  if (live.steps.some((x) => /^\/projects\/[^/]+/.test(x.p))) s.push('project')
  if (acts.has('resume')) s.push('resume')
  if (acts.has('email') || acts.has('linkedin')) s.push('contact')
  if (acts.has('source') || acts.has('evidence')) s.push('code')
  if (ctx.visitor.n > 1) s.push('returning')
  if (acts.has('pweza')) s.push('pweza')
  return s
}

type Counts = Record<string, { up: number; down: number }>
let cache: { at: number; counts: Counts } | null = null

export async function learnedCounts(): Promise<Counts> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.counts
  const counts = await safe(async (r) => (await r.get<Counts>('learn:counts')) || {}, {} as Counts)
  cache = { at: Date.now(), counts }
  return counts
}

/** Points to add (or subtract) for these signals, from Joseph's past ratings. */
export async function learnedAdjust(signals: string[]): Promise<number> {
  const counts = await learnedCounts()
  let adj = 0
  for (const s of signals) {
    const c = counts[s]
    if (!c) continue
    const n = c.up + c.down
    if (n < 3) continue
    const rate = c.up / n                        // 0..1, 0.5 = neutral
    const confidence = Math.min(1, n / 10)
    adj += (rate - 0.5) * 16 * confidence         // at most ±8 per signal
  }
  return Math.max(-25, Math.min(25, Math.round(adj)))
}

/** Record a rating; changing a previous rating moves it rather than double-counting. */
export async function rate(sid: string, signals: string[], vote: 1 | -1) {
  return safe(async (r) => {
    const prev = await r.get<number>(`rated:${sid}`)
    if (prev === vote) return false
    const counts = (await r.get<Counts>('learn:counts')) || {}
    for (const s of signals) {
      const c = (counts[s] ||= { up: 0, down: 0 })
      if (prev === 1) c.up = Math.max(0, c.up - 1)
      if (prev === -1) c.down = Math.max(0, c.down - 1)
      if (vote === 1) c.up++; else c.down++
    }
    await r.set('learn:counts', counts)
    await r.set(`rated:${sid}`, vote, { ex: 120 * 86_400 })
    cache = null
    return true
  }, false)
}

export async function learnedSummary(): Promise<string[]> {
  const counts = await learnedCounts()
  const rows = Object.entries(counts)
    .map(([k, c]) => ({ k, n: c.up + c.down, rate: c.up / Math.max(1, c.up + c.down) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.rate - a.rate || b.n - a.n)
  if (!rows.length) return ['No ratings yet. Tap 👍 or 👎 under visit alerts and the score starts learning what matters to you.']
  return rows.map((x) => `${x.rate >= 0.6 ? '📈' : x.rate <= 0.4 ? '📉' : '➖'} ${SIGNALS[x.k] || x.k} · ${Math.round(x.rate * 100)}% 👍 (${x.n} rated)${x.n < 3 ? ' · needs 3+' : ''}`)
}

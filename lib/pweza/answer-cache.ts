import { certs } from '@/data'
import { projects } from '@/data/projects'
import { safe } from '@/lib/alerts/store'
import { tokens } from './retrieve'

// 🛟 Verified answer cache. Every AI answer that passes the fact-checker is saved; if every
// AI provider is down, PWEZA answers from the closest verified past answer instead of
// apologising. A few seed answers built from verified site data cover the top questions
// even before the cache fills.

type Link = { label: string; href: string }
export type CachedAnswer = { q: string; a: string; links: Link[]; t: number }

const KEY = 'pweza:verified'
const MAX = 300
const MIN_SCORE = 0.5

const LEAD = ['blue-soc-p8', 'fortress-v2', 'blue-x', 'pweza-voice-agent']
const flagship = LEAD.map((id) => projects.find((p) => p.id === id && p.placement)).filter((p): p is (typeof projects)[number] => !!p)
const earned = certs.filter((c) => c.status === 'earned').map((c) => c.name)

/** Built from data/ at build time, so it can only say what the site already verifies. */
const SEEDS: CachedAnswer[] = [
  {
    q: 'what makes joseph different special unique stand out why should we hire him strengths good fit candidate',
    a: `He builds working security tools, not just coursework: ${flagship.slice(0, 3).map((p) => `${p.title} (${p.subtitle.split(/ — | \| /)[0].trim()})`).join(', ')}. He backs that with ${earned.slice(0, -1).join(', ')} and ${earned[earned.length - 1]}, and he's finishing a B.S. in Cybersecurity at BYU-Idaho in December 2026.`,
    links: flagship.slice(0, 2).map((p) => ({ label: p.title, href: `/projects/${p.id}` })).concat({ label: 'Credentials', href: '/#credentials' }),
    t: 0,
  },
  {
    q: 'who is joseph what does he do summary overview background',
    a: "Joseph Allan Kamara (he goes by Allan too) is a cybersecurity student and builder focused on SOC automation, AWS cloud security and AI security tools. He's based in Philadelphia, graduates from BYU-Idaho in December 2026, and is open to SOC, security engineering, cloud security and IT roles.",
    links: [{ label: 'His story', href: '/#story' }, { label: 'All work', href: '/#work' }],
    t: 0,
  },
]

function score(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0
  const A = new Set(a), B = new Set(b)
  let inter = 0
  A.forEach((t) => { if (B.has(t)) inter++ })
  // Mix of overlap with the visitor's question (containment) and overall similarity (Jaccard)
  return 0.6 * (inter / A.size) + 0.4 * (inter / (A.size + B.size - inter))
}

export async function saveVerified(question: string, answer: string, links: Link[]) {
  const q = question.trim().slice(0, 300)
  if (answer.length < 40 || tokens(q).length < 2) return
  const item: CachedAnswer = { q, a: answer.slice(0, 1500), links: links.slice(0, 3), t: Date.now() }
  await safe(async (r) => {
    await r.lpush(KEY, JSON.stringify(item))
    await r.ltrim(KEY, 0, MAX - 1)
  }, undefined)
}

/** Closest verified answer to this question, or null if nothing is close enough. */
export async function findVerified(question: string): Promise<CachedAnswer | null> {
  const qt = tokens(question)
  if (qt.length < 1) return null
  const stored = await safe(async (r) => (await r.lrange(KEY, 0, MAX - 1)) as unknown[], [] as unknown[])
  const pool: CachedAnswer[] = SEEDS.concat(
    stored.map((x) => { try { return (typeof x === 'string' ? JSON.parse(x) : x) as CachedAnswer } catch { return null } })
      .filter((x): x is CachedAnswer => !!x && typeof x.a === 'string'),
  )
  let best: CachedAnswer | null = null, bestScore = 0
  for (const c of pool) {
    const s = score(qt, tokens(c.q))
    if (s > bestScore || (s === bestScore && best && c.t > best.t)) { best = c; bestScore = s }
  }
  return best && bestScore >= MIN_SCORE ? best : null
}

import { Redis } from '@upstash/redis'

// Visit history, stats, PWEZA teachings, lead feedback and live-chat state in Upstash Redis.
// Everything here is best-effort: if the database is missing or down, alerts keep working.

let client: Redis | null | undefined
export function db(): Redis | null {
  if (client !== undefined) return client
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  client = url && token ? new Redis({ url, token }) : null
  return client
}
export const hasDb = () => !!db()

const DAY = 86_400
const KEEP = 120 * DAY

export async function safe<T>(fn: (r: Redis) => Promise<T>, fallback: T): Promise<T> {
  const r = db()
  if (!r) return fallback
  try { return await fn(r) } catch { return fallback }
}

/** YYYY-MM-DD in the alert time zone. */
export function dayKey(ts: number, tz: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts))
  } catch { return new Date(ts).toISOString().slice(0, 10) }
}

export type VisitRecord = {
  sid: string; start: number; last: number; durMs: number
  who: string; company?: string; companyType?: string; target?: string; via?: string; watch?: string
  ref: string; refKind: string; role?: string | null
  city?: string; region?: string; country?: string
  device: string; visitN: number; bot: boolean
  pages: { p: string; n: string; d: number; s: number }[]
  sections: Record<string, number>
  actions: string[]
  score: number; brief?: string; msgId?: number; ended: boolean
  signals?: string[]
}

/** Upsert a visit; counts it in the day's stats the first time it is seen. */
export async function saveVisit(v: VisitRecord, tz: string, firstTime: boolean) {
  await safe(async (r) => {
    const p = r.pipeline()
    p.set(`visit:${v.sid}`, v, { ex: KEEP })
    p.zadd('visits', { score: v.start, member: v.sid })
    if (v.msgId) p.set(`tgmsg:${v.msgId}`, `visit:${v.sid}`, { ex: KEEP })
    if (firstTime && !v.bot) {
      const d = dayKey(v.start, tz)
      p.hincrby(`stats:${d}`, 'visits', 1)
      if (v.visitN > 1) p.hincrby(`stats:${d}`, 'returning', 1)
      if (v.target || v.watch || v.via) p.hincrby(`stats:${d}`, 'priority', 1)
      p.zincrby(`top:refs:${d}`, 1, v.ref)
      if (v.country) p.zincrby(`top:countries:${d}`, 1, v.country)
      if (v.company || v.target) p.zincrby(`top:orgs:${d}`, 1, v.target || v.company!)
      p.expire(`stats:${d}`, KEEP); p.expire(`top:refs:${d}`, KEEP); p.expire(`top:countries:${d}`, KEEP); p.expire(`top:orgs:${d}`, KEEP)
    }
    await p.exec()
  }, null)
}

/** Count pages once per visit when the visit ends (so reloads don't inflate). */
export async function countPages(v: VisitRecord, tz: string) {
  await safe(async (r) => {
    const first = await r.set(`counted:${v.sid}`, 1, { nx: true, ex: 2 * DAY })
    if (!first) return
    const d = dayKey(v.start, tz)
    const p = r.pipeline()
    for (const n of Array.from(new Set(v.pages.map((x) => x.n)))) p.zincrby(`top:pages:${d}`, 1, n)
    p.hincrby(`stats:${d}`, 'timeMs', v.durMs)
    p.expire(`top:pages:${d}`, KEEP)
    await p.exec()
  }, null)
}

export async function bump(field: string, tz: string, by = 1) {
  await safe(async (r) => {
    const d = dayKey(Date.now(), tz)
    await r.hincrby(`stats:${d}`, field, by)
    await r.expire(`stats:${d}`, KEEP)
  }, null)
}

export async function getVisit(sid: string) {
  return safe((r) => r.get<VisitRecord>(`visit:${sid}`), null)
}

export async function recentVisits(sinceTs: number, limit = 300): Promise<VisitRecord[]> {
  return safe(async (r) => {
    const ids = await r.zrange<string[]>('visits', '+inf', sinceTs, { byScore: true, rev: true, offset: 0, count: limit })
    if (!ids.length) return []
    const rows = await r.mget<(VisitRecord | null)[]>(...ids.map((id) => `visit:${id}`))
    return rows.filter(Boolean) as VisitRecord[]
  }, [])
}

export type DayStats = { day: string; visits: number; returning: number; priority: number; leads: number; chats: number; security: number; timeMs: number }

export async function statsFor(days: string[]): Promise<DayStats[]> {
  return safe(async (r) => {
    const p = r.pipeline()
    days.forEach((d) => p.hgetall(`stats:${d}`))
    const res = (await p.exec()) as (Record<string, string | number> | null)[]
    return days.map((day, i) => {
      const h = res[i] || {}
      const n = (k: string) => Number(h[k] || 0)
      return { day, visits: n('visits'), returning: n('returning'), priority: n('priority'), leads: n('leads'), chats: n('chats'), security: n('security'), timeMs: n('timeMs') }
    })
  }, days.map((day) => ({ day, visits: 0, returning: 0, priority: 0, leads: 0, chats: 0, security: 0, timeMs: 0 })))
}

/** Merge sorted sets across days and return the top entries. */
export async function topAcross(prefix: string, days: string[], n = 5): Promise<[string, number][]> {
  return safe(async (r) => {
    const p = r.pipeline()
    days.forEach((d) => p.zrange(`${prefix}:${d}`, 0, 50, { rev: true, withScores: true }))
    const res = (await p.exec()) as (string | number)[][]
    const total = new Map<string, number>()
    for (const arr of res) for (let i = 0; i < (arr?.length || 0); i += 2) total.set(String(arr[i]), (total.get(String(arr[i])) || 0) + Number(arr[i + 1]))
    return Array.from(total.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)
  }, [])
}

export function lastDays(n: number, tz: string, endTs = Date.now()) {
  return Array.from({ length: n }, (_, i) => dayKey(endTs - i * DAY * 1000, tz)).reverse()
}

// ---------- PWEZA chat log (for weekly "what recruiters ask") ----------

export async function logQuestion(q: string, tz: string) {
  await safe(async (r) => {
    const d = dayKey(Date.now(), tz)
    await r.lpush(`questions:${d}`, q.slice(0, 300))
    await r.ltrim(`questions:${d}`, 0, 199)
    await r.expire(`questions:${d}`, 60 * DAY)
  }, null)
}

export async function questionsFor(days: string[]): Promise<string[]> {
  return safe(async (r) => {
    const p = r.pipeline()
    days.forEach((d) => p.lrange(`questions:${d}`, 0, 199))
    return ((await p.exec()) as string[][]).flat().filter(Boolean)
  }, [])
}

// ---------- Teach PWEZA ----------

export type Teaching = { q: string; a: string; at: number }
let teachCache: { at: number; list: Teaching[] } | null = null

export async function teachings(): Promise<Teaching[]> {
  if (teachCache && Date.now() - teachCache.at < 60_000) return teachCache.list
  const list = await safe(async (r) => {
    const h = await r.hgetall<Record<string, Teaching>>('pweza:teach')
    return Object.values(h || {}).sort((a, b) => b.at - a.at)
  }, [] as Teaching[])
  teachCache = { at: Date.now(), list }
  return list
}

export const teachKey = (q: string) => q.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)

export async function teach(q: string, a: string) {
  teachCache = null
  return safe(async (r) => { await r.hset('pweza:teach', { [teachKey(q)]: { q, a, at: Date.now() } }); return true }, false)
}

export async function forget(q: string) {
  teachCache = null
  return safe(async (r) => (await r.hdel('pweza:teach', teachKey(q))) > 0, false)
}

// ---------- message ↔ visit / chat mapping ----------

export async function mapMessage(messageId: number, target: string, ttl = KEEP) {
  await safe((r) => r.set(`tgmsg:${messageId}`, target, { ex: ttl }), null)
}
export async function lookupMessage(messageId: number) {
  return safe((r) => r.get<string>(`tgmsg:${messageId}`), null)
}

// ---------- once-per-period guard (crons) ----------

export async function once(key: string, ttlSec: number) {
  return safe(async (r) => !!(await r.set(`once:${key}`, 1, { nx: true, ex: ttlSec })), true)
}

import { safe, mapMessage } from './store'

// 🎙 Live chat takeover: Joseph answers a visitor's PWEZA chat himself from Telegram.
// Telegram replies are queued per chat session; the visitor's chat window polls for them.

const TTL = 30 * 60 // a takeover lapses after 30 quiet minutes
export const validSid = (s: unknown): s is string => typeof s === 'string' && /^[a-z0-9]{8,40}$/i.test(s)

export async function liveOn(sid: string) {
  await safe(async (r) => {
    await r.set(`live:${sid}`, Date.now(), { ex: TTL })
    await r.set('live:last', sid, { ex: TTL })
  }, null)
}

export async function liveOff(sid: string) {
  await safe(async (r) => {
    await r.del(`live:${sid}`)
    await r.rpush(`live:${sid}:out`, JSON.stringify({ t: '__handback__', at: Date.now() }))
    await r.expire(`live:${sid}:out`, 3600)
  }, null)
}

export async function isLive(sid: string) {
  return safe(async (r) => !!(await r.get(`live:${sid}`)), false)
}

export async function lastLive() {
  return safe((r) => r.get<string>('live:last'), null)
}

export async function touch(sid: string) {
  await safe(async (r) => { await r.expire(`live:${sid}`, TTL); await r.set('live:last', sid, { ex: TTL }) }, null)
}

export async function pushOut(sid: string, text: string) {
  await safe(async (r) => {
    await r.rpush(`live:${sid}:out`, JSON.stringify({ t: text.slice(0, 2000), at: Date.now() }))
    await r.expire(`live:${sid}:out`, 3600)
  }, null)
  await touch(sid)
}

export async function readOut(sid: string, after: number) {
  return safe(async (r) => {
    const rows = await r.lrange<string | { t: string; at: number }>(`live:${sid}:out`, after, after + 49)
    return rows.map((x) => (typeof x === 'string' ? JSON.parse(x) : x)) as { t: string; at: number }[]
  }, [] as { t: string; at: number }[])
}

export const linkChat = (messageId: number, sid: string) => mapMessage(messageId, `chat:${sid}`, 2 * 86_400)

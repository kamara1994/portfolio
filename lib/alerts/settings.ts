import { tg, sendMessage, editMessage, chatId, esc } from './telegram'

// Alert settings live in a pinned message in the Telegram chat itself, so mute,
// quiet hours, time zone and topic IDs survive deploys without a database.

export type Topics = { priority: number; visits: number; chats: number; leads: number }
export type Settings = {
  v: 1
  tz: string
  mutedUntil?: number
  quiet?: { from: number; to: number } | null
  topics?: Topics | null
  topicsTriedAt?: number
  pinId?: number
}

const DEFAULTS: Settings = { v: 1, tz: 'America/New_York', quiet: null }
const MARK = 'PWEZA-CFG'
let cache: { at: number; s: Settings } | null = null

export async function getSettings(force = false): Promise<Settings> {
  if (!force && cache && Date.now() - cache.at < 30_000) return cache.s
  let s: Settings = { ...DEFAULTS }
  const r = await tg<any>('getChat', { chat_id: chatId() }, 4000)
  const pin = r.ok ? r.result?.pinned_message : null
  const text: string = pin?.text || ''
  const m = text.match(new RegExp(`${MARK} (\\{[\\s\\S]*\\})\\s*$`))
  if (m) {
    try { s = { ...DEFAULTS, ...JSON.parse(m[1]), pinId: pin.message_id } } catch { /* keep defaults */ }
  }
  cache = { at: Date.now(), s }
  return s
}

export function fmtDuration(ms: number) {
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h}h ${r}m` : `${h}h`
}

function hourLabel(h: number) {
  const ampm = h < 12 ? 'am' : 'pm'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}${ampm}`
}

export function describe(s: Settings) {
  const now = Date.now()
  const muted = s.mutedUntil && s.mutedUntil > now ? `🔕 Muted for ${fmtDuration(s.mutedUntil - now)} more` : '🔔 Alerts on'
  const quiet = s.quiet ? `🌙 Quiet hours ${hourLabel(s.quiet.from)}–${hourLabel(s.quiet.to)}` : '🌙 No quiet hours'
  const topics = s.topics ? '🗂 Topics on' : '🗂 Topics off'
  return [muted, quiet, `🕐 Time zone ${s.tz}`, topics]
}

export async function saveSettings(s: Settings): Promise<Settings> {
  const { pinId, ...data } = s
  const text = [
    '⚙️ <b>Portfolio alert settings</b>',
    ...describe(s),
    '',
    'Change with /mute, /quiet, /tz, /topics · /help',
    `<code>${MARK} ${esc(JSON.stringify(data))}</code>`,
  ].join('\n')
  if (pinId) {
    const r = await editMessage(pinId, text)
    if (r.ok) { cache = { at: Date.now(), s }; return s }
  }
  const sent = await sendMessage(text, { silent: true })
  if (sent.ok && sent.result) {
    s.pinId = sent.result.message_id
    await tg('pinChatMessage', { chat_id: chatId(), message_id: s.pinId, disable_notification: true })
  }
  cache = { at: Date.now(), s }
  return s
}

/** Topic tabs (🔥 Priority, 👀 Visits, 💬 PWEZA chats, ⭐ Leads). Needs topics enabled for the bot / group. */
export async function ensureTopics(s: Settings, force = false): Promise<Topics | null> {
  if (s.topics) return s.topics
  if (!force && s.topicsTriedAt && Date.now() - s.topicsTriedAt < 24 * 3600_000) return null
  const make = async (name: string, color: number) => {
    const r = await tg<{ message_thread_id: number }>('createForumTopic', { chat_id: chatId(), name, icon_color: color })
    return r.ok ? r.result!.message_thread_id : 0
  }
  const priority = await make('🔥 Priority', 0xFB6F5F)
  if (!priority) {
    await saveSettings({ ...s, topics: null, topicsTriedAt: Date.now() })
    return null
  }
  const topics: Topics = {
    priority,
    visits: await make('👀 Visits', 0x6FB9F0),
    chats: await make('💬 PWEZA chats', 0x8EEE98),
    leads: await make('⭐ Leads', 0xFFD67E),
  }
  await saveSettings({ ...s, topics, topicsTriedAt: Date.now() })
  return topics
}

function hourIn(tz: string) {
  try {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date()))
  } catch { return new Date().getUTCHours() }
}

/** Whether alerts should arrive silently right now (muted or inside quiet hours). */
export function isHushed(s: Settings) {
  if (s.mutedUntil && s.mutedUntil > Date.now()) return true
  if (s.quiet) {
    const h = hourIn(s.tz)
    const { from, to } = s.quiet
    return from <= to ? h >= from && h < to : h >= from || h < to
  }
  return false
}

export function validTz(tz: string) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true } catch { return false }
}

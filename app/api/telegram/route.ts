import { NextRequest, NextResponse } from 'next/server'
import { tg, chatId, webhookSecret, sendMessage, esc } from '@/lib/alerts/telegram'
import { getSettings, saveSettings, ensureTopics, describe, fmtDuration, validTz, isHushed } from '@/lib/alerts/settings'
import { renderVisit, visitButtons, type Ctx } from '@/lib/alerts/format'

// Telegram webhook: lets Joseph control his visitor alerts by chatting with the bot.
// Only updates carrying the secret header AND coming from his own chat are accepted.

export const runtime = 'nodejs'

const HELP = [
  '🤖 <b>Portfolio alert bot</b>',
  '',
  '/status — current settings',
  '/mute 2h — silence alerts (30m, 2h, 1d…; default 1h)',
  '/unmute — turn alerts back on',
  '/quiet 23-7 — silent overnight (24h clock) · /quiet off',
  '/tz America/New_York — time zone for alerts',
  '/topics — sort alerts into topic tabs',
  '/test — send a sample visitor alert',
  '',
  'Normal visits arrive silently. Priority companies, résumé/email/LinkedIn clicks and strong leads buzz your phone unless muted or in quiet hours.',
].join('\n')

function parseDuration(arg: string): number | null {
  if (!arg) return 60
  const m = arg.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)?$/)
  if (!m) return null
  const n = parseFloat(m[1]); const u = m[2] || 'h'
  const mins = u.startsWith('m') ? n : u.startsWith('d') ? n * 1440 : n * 60
  return mins > 0 && mins <= 60 * 24 * 30 ? Math.round(mins) : null
}

async function reply(text: string, thread?: number) {
  await sendMessage(text, { thread, silent: true })
}

async function sample(tz: string) {
  const ctx: Ctx = {
    v: 1, sid: 'test', start: Date.now() - 252_000, ip: '203.0.113.7',
    geo: { city: 'Philadelphia', region: 'Pennsylvania', country: 'US', zip: '19103', lat: 39.95, lon: -75.17, tz: 'America/New_York', org: 'Example Corp', company: { name: 'Example Corp', domain: 'example.com', type: 'business' } },
    device: 'Chrome · macOS · Desktop', screen: '1512x982', lang: 'en-US',
    ref: { label: 'LinkedIn', kind: 'job', host: 'linkedin.com' }, refRaw: 'https://www.linkedin.com/',
    target: '', bot: '', visitor: { n: 2, last: Date.now() - 3 * 86400_000 }, landing: '/',
  }
  const live = {
    steps: [{ p: '/', d: 38_000, s: 72 }, { p: '/projects/blue-soc-p8', d: 141_000, s: 88 }, { p: '/recruiter', d: 54_000, s: 100 }],
    actions: ['source', 'resume'], durMs: 252_000, role: 'recruiter', ended: true, human: true,
  }
  return sendMessage('🧪 <i>Sample alert</i>\n\n' + renderVisit(ctx, live, 86, tz, 'Likely a recruiter who found you on LinkedIn and focused on BLUE SOC before opening your résumé. Worth a short LinkedIn note today.'), {
    silent: true, buttons: visitButtons(ctx, live),
  })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret()) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const update = await req.json().catch(() => ({}))
  const mine = chatId()

  // Inline buttons under alerts (🔕 Mute 1h / 8h)
  const cb = update.callback_query
  if (cb) {
    if (String(cb.message?.chat?.id) !== mine) return NextResponse.json({ ok: true })
    const m = String(cb.data || '').match(/^mute:(\d+)$/)
    let text = 'Done'
    if (m) {
      const s = await getSettings(true)
      await saveSettings({ ...s, mutedUntil: Date.now() + Number(m[1]) * 60_000 })
      text = `🔕 Muted for ${fmtDuration(Number(m[1]) * 60_000)}`
    }
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text })
    return NextResponse.json({ ok: true })
  }

  const msg = update.message
  if (!msg || String(msg.chat?.id) !== mine || typeof msg.text !== 'string') return NextResponse.json({ ok: true })
  const thread: number | undefined = msg.message_thread_id
  const [rawCmd, ...rest] = msg.text.trim().split(/\s+/)
  const cmd = rawCmd.toLowerCase().replace(/@.*$/, '')
  const arg = rest.join(' ')
  const s = await getSettings(true)

  switch (cmd) {
    case '/start':
    case '/help':
      await reply(HELP, thread); break
    case '/status':
      await reply(['⚙️ <b>Alert settings</b>', ...describe(s), isHushed(s) ? '\nRight now: alerts arrive silently.' : '\nRight now: important alerts will buzz.'].join('\n'), thread); break
    case '/mute': {
      const mins = parseDuration(arg)
      if (mins == null) { await reply('Try /mute 30m, /mute 2h or /mute 1d', thread); break }
      await saveSettings({ ...s, mutedUntil: Date.now() + mins * 60_000 })
      await reply(`🔕 Muted for ${fmtDuration(mins * 60_000)}. Alerts still arrive, silently.`, thread); break
    }
    case '/unmute':
      await saveSettings({ ...s, mutedUntil: undefined })
      await reply('🔔 Alerts are back on.', thread); break
    case '/quiet': {
      if (/^off$/i.test(arg)) { await saveSettings({ ...s, quiet: null }); await reply('🌙 Quiet hours off.', thread); break }
      const m = arg.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/)
      if (!m || +m[1] > 23 || +m[2] > 23) { await reply('Use 24-hour clock, e.g. /quiet 23-7 (11pm to 7am), or /quiet off', thread); break }
      const next = await saveSettings({ ...s, quiet: { from: +m[1], to: +m[2] } })
      await reply(describe(next)[1], thread); break
    }
    case '/tz': {
      if (!arg || !validTz(arg)) { await reply(`Current: ${esc(s.tz)}\nUse a zone name like /tz America/New_York or /tz America/Denver`, thread); break }
      await saveSettings({ ...s, tz: arg })
      await reply(`🕐 Time zone set to ${esc(arg)}`, thread); break
    }
    case '/topics': {
      const t = await ensureTopics(s, true)
      await reply(t
        ? '🗂 Topics ready: 🔥 Priority · 👀 Visits · 💬 PWEZA chats · ⭐ Leads. New alerts will be sorted into them.'
        : '🗂 Couldn\'t create topics. In @BotFather, open your bot → Bot Settings and turn on topics (threaded mode) — or use a group with Topics enabled and the bot as admin. Then send /topics again.', thread)
      break
    }
    case '/test':
      await sample(s.tz); break
    default:
      if (cmd.startsWith('/')) await reply('Unknown command. /help lists what I can do.', thread)
  }
  return NextResponse.json({ ok: true })
}

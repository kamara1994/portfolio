import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { tg, chatId, webhookSecret, sendMessage, sendPhoto, esc, SITE } from '@/lib/alerts/telegram'
import { draftFollowUp, redraft, prepPack } from '@/lib/alerts/assist'
import { healthReport } from '@/lib/alerts/health'
import { viaSlug } from '@/lib/alerts/slug'
import { BOT_COMMANDS } from '@/lib/alerts/commands'
import { dayReport, weekReport, topReport, voiceScript } from '@/lib/alerts/reports'
import { sendVoiceNote } from '@/lib/alerts/voice'
import { answerFromData } from '@/lib/alerts/askdata'
import { rate, learnedSummary } from '@/lib/alerts/learn'
import { hasDb, lookupMessage, getVisit, teach, forget, teachings } from '@/lib/alerts/store'
import { liveOn, liveOff, pushOut, lastLive, linkChat, validSid } from '@/lib/alerts/live'
import { companyIntel, renderIntel, searchConfigured } from '@/lib/integrations/search'
import { smsConfigured, smsEnabled, setSms, sendSms } from '@/lib/integrations/sms'
import { bookingUrl } from '@/lib/integrations/booking'
import { stashedQuestion, setOnline, isOnline } from '@/lib/pweza/extras'
import { safe as dbSafe, mapMessage } from '@/lib/alerts/store'
import { getSettings, saveSettings, ensureTopics, describe, fmtDuration, validTz, isHushed } from '@/lib/alerts/settings'
import { renderVisit, visitButtons, type Ctx } from '@/lib/alerts/format'

// Telegram webhook: lets Joseph control his visitor alerts by chatting with the bot.
// Only updates carrying the secret header AND coming from his own chat are accepted.

export const runtime = 'nodejs'
export const maxDuration = 30

let commandsSynced = false

const HELP = [
  '🤖 <b>Portfolio alert bot</b>',
  '',
  '/status — current settings',
  '/mute 2h — silence alerts (30m, 2h, 1d…; default 1h)',
  '/unmute — turn alerts back on',
  '/quiet 23-7 — silent overnight (24h clock) · /quiet off',
  '/tz America/New_York — time zone for alerts',
  '/topics — sort alerts into topic tabs',
  '/watch Deloitte — 🔥 alert when they visit · /unwatch · /watchlist',
  '/qr byui-fair — QR code for a tagged link (career fairs, cards)',
  '/health — check the site, PWEZA AI, voice and lookups',
  '',
  '📊 /dashboard — live dashboard inside Telegram (also the Dashboard button by the message box)',
  '📊 /today · /week · /top — stats   🔊 /briefing — voice summary now',
  '🧠 /teach question | answer — PWEZA learns it · /taught · /forget question',
  '📈 /score — what the self-learning lead score has learned from your 👍/👎',
  '🟢 /online · /offline — show visitors you\'re available to chat live',
  '🎙 Reply with a voice note to a live chat and the visitor hears it',
  '🔎 /intel Company — research an employer (also a button on leads)',
  '📱 /sms on · off · test — text alerts for the most important moments',
  '📅 /book — your interview booking link',
  '🎙 Tap “Take over this chat” on a PWEZA alert to answer a visitor yourself · /end hands back',
  '💬 Or just ask me in plain English, e.g. "who looked at my AWS projects this week?"',
  '/test — send a sample visitor alert',
  '',
  '🔗 Company links: put josephkamara.vercel.app/deloitte (any word) in an application — visits through it are tagged and buzz your phone.',
  '✍️ / 🎓 buttons under alerts draft a follow-up or an interview prep pack.',
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
  if (!commandsSynced) {
    commandsSynced = true // keeps the command menu + Dashboard button current after deploys
    await tg('setMyCommands', { commands: BOT_COMMANDS })
    if (!mine.startsWith('-')) await tg('setChatMenuButton', { chat_id: mine, menu_button: { type: 'web_app', text: 'Dashboard', web_app: { url: `${SITE}/tg/dashboard` } } })
  }

  // Inline buttons under alerts (🔕 Mute 1h / 8h)
  const cb = update.callback_query
  if (cb) {
    if (String(cb.message?.chat?.id) !== mine) return NextResponse.json({ ok: true })
    const data = String(cb.data || '')
    const source: string = cb.message?.text || cb.message?.caption || ''
    const thread: number | undefined = cb.message?.message_thread_id
    const replyTo: number | undefined = cb.message?.message_id
    if (data === 'draft' || data === 'prep' || data.startsWith('redraft:')) {
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: data === 'prep' ? '🎓 Building prep pack…' : '✍️ Writing…' })
      if (data === 'prep') {
        await sendMessage(`🎓 <b>Interview prep pack</b>\n\n${esc(await prepPack(source))}`, { thread, replyTo, silent: true })
      } else {
        const style = data.split(':')[1] as 'short' | 'formal' | 'warm' | undefined
        const draftText = style ? await redraft(source.replace(/^✍️ Follow-up drafts\s*/, ''), style) : await draftFollowUp(source)
        await sendMessage(`✍️ <b>Follow-up drafts</b>\n\n${esc(draftText)}\n\n<i>Copy, personalise with their name, send.</i>`, {
          thread, replyTo, silent: true,
          buttons: [[{ text: '✂️ Shorter', callback_data: 'redraft:short' }, { text: '🎩 More formal', callback_data: 'redraft:formal' }, { text: '😊 Warmer', callback_data: 'redraft:warm' }]],
        })
      }
      return NextResponse.json({ ok: true })
    }
    if (data.startsWith('intel:')) {
      const company = data.slice(6)
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: searchConfigured() ? `🔎 Researching ${company}…` : 'Add TAVILY_API_KEY in Vercel first' })
      if (searchConfigured()) {
        const intel = await companyIntel(company)
        await sendMessage(intel ? renderIntel(intel, esc) : `🔎 Couldn't find solid information on ${esc(company)}.`, { thread, replyTo, silent: true })
      }
      return NextResponse.json({ ok: true })
    }
    const tq = data.match(/^teachq:([a-z0-9]{6,12})$/)
    if (tq) {
      const q = await stashedQuestion(tq[1])
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: q ? '✏️ Reply with the answer' : 'That question expired' })
      if (q) {
        const m = await sendMessage(`✏️ <b>Reply to this message with the right answer</b> for:\n“${esc(q)}”\n<i>PWEZA will use it from now on.</i>`, { thread, replyTo, silent: true })
        if (m.ok && m.result) await mapMessage(m.result.message_id, `teach:${tq[1]}`, 7 * 86_400)
      }
      return NextResponse.json({ ok: true })
    }
    const lv = data.match(/^live(off)?:([a-z0-9]{8,40})$/i)
    if (lv) {
      const sid = lv[2]
      if (!hasDb()) { await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Needs the database' }); return NextResponse.json({ ok: true }) }
      if (lv[1]) {
        await liveOff(sid)
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: '🤖 PWEZA is answering again' })
        await sendMessage('🤖 Handed back to PWEZA. The visitor was told.', { thread, replyTo, silent: true })
      } else {
        await liveOn(sid)
        await pushOut(sid, '__joined__')
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: '🎙 You\'re live' })
        const m = await sendMessage('🎙 <b>You\'re live with this visitor.</b>\nReply to this message (or any of their messages) to talk — they see it instantly in the chat window as “Joseph”.\nSend /end or tap below to hand back to PWEZA.', {
          thread, replyTo, silent: true, buttons: [[{ text: '🤖 Hand back to PWEZA', callback_data: `liveoff:${sid}` }]],
        })
        if (m.ok && m.result) await linkChat(m.result.message_id, sid)
      }
      return NextResponse.json({ ok: true })
    }
    const rm = data.match(/^rate:(1|-1)$/)
    if (rm) {
      const vote = Number(rm[1]) as 1 | -1
      const key = replyTo ? await lookupMessage(replyTo) : null
      const visit = key?.startsWith('visit:') ? await getVisit(key.slice(6)) : null
      const ok = visit ? await rate(visit.sid, visit.signals || [], vote) : false
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: !hasDb() ? 'Needs the database' : !visit ? 'This alert is too old to rate' : ok ? (vote === 1 ? '👍 Noted — I\'ll score visits like this higher' : '👎 Noted — I\'ll score visits like this lower') : 'Already rated' })
      return NextResponse.json({ ok: true })
    }
    const m = data.match(/^mute:(\d+)$/)
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
  if (!msg || String(msg.chat?.id) !== mine) return NextResponse.json({ ok: true })
  // 🎙 Voice note replied to a live chat → the visitor hears it in their chat window.
  if ((msg.voice || msg.audio) && msg.reply_to_message?.message_id) {
    const key = await lookupMessage(msg.reply_to_message.message_id)
    if (key?.startsWith('chat:')) {
      const sid = key.slice(5)
      const vid = Math.random().toString(36).slice(2, 12)
      await dbSafe((r) => r.set(`voice:${vid}`, (msg.voice || msg.audio).file_id, { ex: 86_400 }), null)
      await liveOn(sid)
      await pushOut(sid, `__voice__:${vid}`)
      await tg('setMessageReaction', { chat_id: mine, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] })
    }
    return NextResponse.json({ ok: true })
  }
  if (typeof msg.text !== 'string') return NextResponse.json({ ok: true })
  const thread: number | undefined = msg.message_thread_id
  // A reply to a live-chat message goes straight to that visitor.
  const repliedTo: number | undefined = msg.reply_to_message?.message_id
  if (repliedTo && !msg.text.startsWith('/')) {
    const key = await lookupMessage(repliedTo)
    if (key?.startsWith('teach:')) {
      const q = await stashedQuestion(key.slice(6))
      const ok = q ? await teach(q, msg.text.trim()) : false
      await reply(ok ? `🧠 Learned. PWEZA will answer “${esc(q!)}” with that from now on.` : 'That question expired — use /teach question | answer.', msg.message_thread_id)
      return NextResponse.json({ ok: true })
    }
    if (key?.startsWith('chat:')) {
      const sid = key.slice(5)
      await liveOn(sid)
      await pushOut(sid, msg.text.trim())
      await tg('setMessageReaction', { chat_id: mine, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] })
      return NextResponse.json({ ok: true })
    }
  }
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
    case '/watch': {
      const term = arg.trim().replace(/\s+/g, ' ').slice(0, 40)
      if (!term) { await reply('Who should I watch? e.g. /watch Deloitte', thread); break }
      const list = Array.from(new Set([...(s.watch || []), term])).slice(0, 30)
      await saveSettings({ ...s, watch: list })
      await reply(`👁 Watching <b>${esc(term)}</b>. You'll get a 🔥 alert when someone from there visits (by network, referrer or your /${esc(term.toLowerCase().replace(/[^a-z0-9]+/g, ''))} link).`, thread); break
    }
    case '/unwatch': {
      const term = arg.trim().toLowerCase()
      const list = (s.watch || []).filter((w) => w.toLowerCase() !== term)
      if (list.length === (s.watch || []).length) { await reply(`Not on the list. /watchlist shows who I'm watching.`, thread); break }
      await saveSettings({ ...s, watch: list })
      await reply(`Stopped watching ${esc(arg.trim())}.`, thread); break
    }
    case '/watchlist':
      await reply(s.watch?.length ? `👁 <b>Watchlist</b>\n${s.watch.map((w) => `• ${esc(w)}`).join('\n')}\n\n/unwatch name to remove` : '👁 Watchlist is empty. Add one with /watch Deloitte', thread); break
    case '/dashboard':
      if (mine.startsWith('-')) { await reply('The dashboard opens in your private chat with the bot.', thread); break }
      await tg('sendMessage', { chat_id: mine, text: '📊 Your live portfolio dashboard', reply_markup: { inline_keyboard: [[{ text: '📊 Open dashboard', web_app: { url: `${SITE}/tg/dashboard` } }]] } })
      break
    case '/today':
      await reply(await dayReport(s.tz, 'Today so far'), thread); break
    case '/week':
      await reply('📈 Building your weekly report…', thread)
      await reply(await weekReport(s.tz), thread); break
    case '/top':
      await reply(await topReport(s.tz), thread); break
    case '/briefing': {
      const r = await sendVoiceNote(await voiceScript(s.tz), '🔊 PWEZA briefing', { thread, silent: true })
      if (!r.ok) await reply('Couldn\'t make the voice note right now. /today has the same info as text.', thread)
      break
    }
    case '/score':
      await reply(['📈 <b>Self-learning lead score</b>', ...(await learnedSummary()).map(esc)].join('\n'), thread); break
    case '/teach': {
      const [q, ...rest] = arg.split('|')
      const a = rest.join('|').trim()
      if (!q?.trim() || !a) { await reply('Format: /teach question | answer\ne.g. /teach Do you have a security clearance? | Not yet, but I\'m eligible and happy to go through the process.', thread); break }
      const ok = await teach(q.trim(), a)
      await reply(ok ? `🧠 PWEZA learned it. When someone asks something like “${esc(q.trim())}”, PWEZA will use your answer.` : 'Couldn\'t save that (database unavailable).', thread); break
    }
    case '/taught': {
      const list = await teachings()
      await reply(list.length ? `🧠 <b>What you've taught PWEZA</b>\n${list.slice(0, 25).map((t) => `• <b>${esc(t.q)}</b>\n  ${esc(t.a)}`).join('\n')}` : 'Nothing taught yet. Try /teach question | answer', thread); break
    }
    case '/forget': {
      const ok = await forget(arg.trim())
      await reply(ok ? 'Forgotten.' : 'Not found. /taught lists the exact questions.', thread); break
    }
    case '/intel': {
      if (!arg.trim()) { await reply('Format: /intel Company name\ne.g. /intel CrowdStrike', thread); break }
      if (!searchConfigured()) { await reply('🔎 Company research needs TAVILY_API_KEY in Vercel.', thread); break }
      await reply(`🔎 Researching ${esc(arg.trim())}…`, thread)
      const intel = await companyIntel(arg.trim())
      await reply(intel ? renderIntel(intel, esc) : `Couldn't find solid information on ${esc(arg.trim())}.`, thread); break
    }
    case '/sms': {
      if (!smsConfigured()) { await reply('📱 Text alerts need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM and ALERT_PHONE in Vercel.', thread); break }
      const a = arg.trim().toLowerCase()
      if (a === 'off') { await setSms(false); await reply('📵 Text alerts paused. /sms on to resume.', thread); break }
      if (a === 'on') { await setSms(true); await reply('📱 Text alerts on: visitors asking for you, leads, bookings and very hot visits (max 12 a day).', thread); break }
      if (a === 'test') { const ok = await sendSms('PWEZA test: text alerts are working.', `test:${Date.now()}`, { ignoreMute: true }); await reply(ok ? '📱 Test text sent.' : '⚠️ The test text failed. Check the Twilio values in Vercel (trial accounts can only text verified numbers).', thread); break }
      await reply(`📱 Text alerts are ${(await smsEnabled()) ? 'on' : 'off'}. Use /sms on · /sms off · /sms test`, thread); break
    }
    case '/book': {
      const u = bookingUrl()
      await reply(u ? `📅 Your booking link (PWEZA shares it with recruiters):\n${esc(u)}` : '📅 Booking needs CAL_LINK in Vercel, e.g. allan-kamara/30min', thread); break
    }
    case '/online':
      await setOnline(true)
      await reply('🟢 You\'re shown as online in PWEZA for the next 8 hours. Visitors see “Joseph is online” and can ask for you. /offline to stop.', thread); break
    case '/offline':
      await setOnline(false)
      await reply('⚪ You\'re shown as offline. PWEZA still pings you if someone asks for you.', thread); break
    case '/end': {
      const sid = validSid(arg.trim()) ? arg.trim() : await lastLive()
      if (!sid) { await reply('No live chat right now.', thread); break }
      await liveOff(sid)
      await reply('🤖 Handed back to PWEZA.', thread); break
    }
    case '/ask':
      await reply(esc(await answerFromData(arg || 'Summarise this week', s.tz)), thread); break
    case '/health':
      await reply('🩺 Checking…', thread)
      await reply(await healthReport(), thread); break
    case '/qr': {
      const slug = viaSlug('/' + arg.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''))
      if (!slug) { await reply('Give it a simple word, e.g. /qr byui-fair or /qr deloitte (letters, numbers, dashes).', thread); break }
      const link = `${SITE}/${slug}`
      const png = await QRCode.toBuffer(link, { width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0A1226', light: '#FFFFFF' } })
      await sendPhoto(new Uint8Array(png), `🔗 <b>${esc(link.replace(/^https:\/\//, ''))}</b>\nEvery scan or visit through this link is tagged <b>/${esc(slug)}</b> and buzzes your phone.\nPrint it on cards, slides or a career-fair sign.`, { thread, silent: true })
      break
    }
    default:
      if (cmd.startsWith('/')) await reply('Unknown command. /help lists what I can do.', thread)
      else if (msg.text.trim().length > 3) await reply(hasDb() ? `💬 ${esc(await answerFromData(msg.text.trim(), s.tz))}` : 'Plain-English questions need the database connected.', thread)
  }
  return NextResponse.json({ ok: true })
}

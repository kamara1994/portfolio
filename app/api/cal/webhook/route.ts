import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { tgConfigured, sendMessage, esc } from '@/lib/alerts/telegram'
import { getSettings } from '@/lib/alerts/settings'
import { sendSms } from '@/lib/integrations/sms'
import { companyIntel, renderIntel, searchConfigured } from '@/lib/integrations/search'
import { bump } from '@/lib/alerts/store'

// 📅 Cal.com webhook: a recruiter booked, rescheduled or cancelled a call.
export const runtime = 'nodejs'

const FREE_MAIL = /^(gmail|yahoo|outlook|hotmail|icloud|aol|proton|protonmail|live|msn|me)\./i

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 })
  const sig = req.headers.get('x-cal-signature-256') || ''
  const want = createHmac('sha256', secret).update(raw).digest('hex')
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return NextResponse.json({ ok: false }, { status: 401 })
  let ev: any
  try { ev = JSON.parse(raw) } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const kind = String(ev.triggerEvent || '')
  const p = ev.payload || {}
  const who = p.attendees?.[0] || {}
  const s = await getSettings()
  const when = p.startTime ? new Date(p.startTime).toLocaleString('en-US', { timeZone: s.tz, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'time unknown'
  const label = kind === 'BOOKING_CREATED' ? '📅 <b>Interview booked!</b>' : kind === 'BOOKING_RESCHEDULED' ? '🔁 <b>Call rescheduled</b>' : kind === 'BOOKING_CANCELLED' ? '❌ <b>Call cancelled</b>' : null
  if (!label) return NextResponse.json({ ok: true, ignored: kind })
  const email = String(who.email || '')
  const domain = email.split('@')[1] || ''
  const notes = String(p.description || p.responses?.notes?.value || '').slice(0, 400)
  if (tgConfigured()) {
    const m = await sendMessage(`${label}\n👤 ${esc(who.name || 'Someone')}${email ? ` · ✉️ ${esc(email)}` : ''}\n🕒 ${esc(when)}\n📝 ${esc(p.title || '')}${notes ? `\n💬 ${esc(notes)}` : ''}${p.location ? `\n📍 ${esc(String(p.location).slice(0, 120))}` : ''}`, {
      thread: s.topics?.leads || s.topics?.priority,
      buttons: email ? [[{ text: '✉️ Email them', url: `mailto:${email}` }, { text: '🎓 Prep pack', callback_data: 'prep' }]] : undefined,
    })
    if (kind === 'BOOKING_CREATED') {
      await bump('leads', s.tz)
      if (domain && !FREE_MAIL.test(domain) && searchConfigured()) {
        const intel = await companyIntel(domain)
        if (intel) await sendMessage(renderIntel(intel, esc), { thread: s.topics?.leads || s.topics?.priority, silent: true, replyTo: m.ok && m.result ? m.result.message_id : undefined })
      }
    }
  }
  if (kind !== 'BOOKING_RESCHEDULED') await sendSms(`PWEZA: ${kind === 'BOOKING_CREATED' ? 'Interview booked' : 'Call cancelled'} — ${who.name || email || 'someone'}, ${when}.`, `cal:${p.uid || p.bookingId || Date.now()}`, { ignoreMute: true })
  return NextResponse.json({ ok: true })
}

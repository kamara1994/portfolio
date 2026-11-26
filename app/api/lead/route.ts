import { NextRequest, NextResponse } from 'next/server'
import { validSid, linkChat } from '@/lib/alerts/live'
import { safe, once, bump } from '@/lib/alerts/store'
import { getSettings, isHushed } from '@/lib/alerts/settings'
import { tgConfigured, sendMessage, esc } from '@/lib/alerts/telegram'
import { sendSms } from '@/lib/integrations/sms'
import { companyIntel, renderIntel, searchConfigured, intelButton } from '@/lib/integrations/search'
import { bookingUrl } from '@/lib/integrations/booking'

// 📇 Lead capture with consent: a visitor asks Joseph to follow up.
export const runtime = 'nodejs'
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const email = str(b.email, 120).toLowerCase()
  if (b.consent !== true || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  const sid = validSid(b.sid) ? b.sid : ''
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  if (!(await once(`lead:${sid || ip}`, 3600))) return NextResponse.json({ ok: true, duplicate: true })
  const lead = { name: str(b.name, 80), email, company: str(b.company, 80), note: str(b.note, 400), at: Date.now() }
  await safe(async (r) => { await r.lpush('leads', JSON.stringify(lead)); await r.ltrim('leads', 0, 499) }, null)
  if (tgConfigured()) {
    const s = await getSettings()
    await bump('leads', s.tz)
    const m = await sendMessage(`📇 <b>New lead from PWEZA</b>\n👤 ${esc(lead.name || 'No name given')}${lead.company ? ` · 🏢 ${esc(lead.company)}` : ''}\n✉️ ${esc(email)}${lead.note ? `\n📝 ${esc(lead.note)}` : ''}\n\n<i>They asked you to follow up (consent given).</i>`, {
      thread: s.topics?.leads || s.topics?.priority, silent: isHushed(s),
      buttons: [[{ text: '✉️ Email them', url: `mailto:${email}?subject=${encodeURIComponent('Following up from my portfolio')}` }, ...(sid ? [{ text: '🎙 Join their chat', callback_data: `live:${sid}` }] : [])]],
    })
    if (sid && m.ok && m.result) await linkChat(m.result.message_id, sid)
    // Company domain from the email when no company was typed (skip free mailboxes).
    const domain = email.split('@')[1] || ''
    const company = lead.company || (/^(gmail|yahoo|outlook|hotmail|icloud|aol|proton|protonmail|live|msn|me)\./i.test(domain) ? '' : domain)
    await Promise.all([
      sendSms(`PWEZA lead: ${lead.name || email}${lead.company ? ` (${lead.company})` : ''} wants you to follow up. ${email}`, `lead:${sid || email}`),
      (async () => {
        if (!company || !searchConfigured()) return
        const intel = await companyIntel(company)
        if (intel) await sendMessage(renderIntel(intel, esc), { thread: s.topics?.leads || s.topics?.priority, silent: true, replyTo: m.ok && m.result ? m.result.message_id : undefined })
      })(),
    ])
  }
  return NextResponse.json({ ok: true, book: bookingUrl({ name: lead.name, email, notes: lead.note }) })
}

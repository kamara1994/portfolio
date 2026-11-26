import { NextRequest, NextResponse } from 'next/server'
import { validSid, linkChat } from '@/lib/alerts/live'
import { safe, once, bump } from '@/lib/alerts/store'
import { getSettings, isHushed } from '@/lib/alerts/settings'
import { tgConfigured, sendMessage, esc } from '@/lib/alerts/telegram'

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
  }
  return NextResponse.json({ ok: true })
}

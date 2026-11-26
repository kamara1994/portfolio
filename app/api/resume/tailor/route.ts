import { NextRequest, NextResponse } from 'next/server'
import { tailor, saveTailored } from '@/lib/pweza/resume'
import { once } from '@/lib/alerts/store'
import { validSid } from '@/lib/alerts/live'
import { tgConfigured, sendMessage, esc, SITE } from '@/lib/alerts/telegram'
import { getSettings } from '@/lib/alerts/settings'

export const runtime = 'nodejs'
export const maxDuration = 40

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const target = typeof b.target === 'string' ? b.target.slice(0, 4000) : ''
  const sid = validSid(b.sid) ? b.sid : ''
  if (target.length < 3) return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 })
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  if (!(await once(`cv:${sid || ip}:${Math.floor(Date.now() / 60_000)}`, 60))) return NextResponse.json({ ok: false, error: 'slow-down' }, { status: 429 })
  const t = await tailor(target)
  if (!t) return NextResponse.json({ ok: false, error: 'unavailable' })
  const id = await saveTailored(t)
  if (!id) return NextResponse.json({ ok: false, error: 'unavailable' })
  const url = `/api/resume/tailored/${id}`
  if (tgConfigured()) {
    const s = await getSettings()
    await sendMessage(`📄 <b>A visitor generated a tailored résumé</b>\n🎯 ${esc(t.role)}\n🔗 ${esc(SITE + url)}`, { thread: s.topics?.priority, silent: true, buttons: [[{ text: '📄 Open PDF', url: SITE + url }]] })
  }
  return NextResponse.json({ ok: true, url, role: t.role })
}

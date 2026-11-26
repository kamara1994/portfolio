import { NextRequest, NextResponse } from 'next/server'
import { tgConfigured, sendMessage } from '@/lib/alerts/telegram'
import { getSettings } from '@/lib/alerts/settings'
import { dayReport, weekReport, voiceScript } from '@/lib/alerts/reports'
import { sendVoiceNote } from '@/lib/alerts/voice'
import { hasDb, once, dayKey } from '@/lib/alerts/store'

// Runs once a day (vercel.json → crons). Evening summary + voice briefing; weekly report on Sundays.
// Guarded so a manual or repeated call can't send it twice in a day.

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 })
  if (!tgConfigured() || !hasDb()) return NextResponse.json({ ok: false, error: 'not-configured' })
  const s = await getSettings()
  const day = dayKey(Date.now(), s.tz)
  if (!(await once(`daily:${day}`, 20 * 3600))) return NextResponse.json({ ok: true, skipped: 'already-sent' })

  const thread = s.topics?.priority
  await sendMessage(await dayReport(s.tz, 'Evening summary'), { thread, silent: true })
  try { await sendVoiceNote(await voiceScript(s.tz), '🔊 PWEZA evening briefing', { thread, silent: true }) } catch { /* voice is a bonus */ }

  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: s.tz, weekday: 'short' }).format(new Date())
  if (weekday === 'Sun') await sendMessage(await weekReport(s.tz), { thread, silent: true })
  return NextResponse.json({ ok: true, day, weekly: weekday === 'Sun' })
}

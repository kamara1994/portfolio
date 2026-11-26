import { NextRequest, NextResponse } from 'next/server'
import { verifyInitData } from '@/lib/alerts/webapp'
import { getSettings } from '@/lib/alerts/settings'
import { statsFor, topAcross, lastDays, recentVisits, hasDb } from '@/lib/alerts/store'
import { ACTIONS } from '@/lib/alerts/intel'

// Data for the Telegram Mini App dashboard. Only answers Joseph's own signed Telegram session.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = verifyInitData(req.headers.get('x-tg-init') || '')
  if (!auth.ok) return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 })
  if (!hasDb()) return NextResponse.json({ ok: false, reason: 'no-database' })
  const s = await getSettings()
  const days = lastDays(30, s.tz)
  const week = days.slice(-7)
  const [rows, pages, refs, orgs, countries, visits] = await Promise.all([
    statsFor(days), topAcross('top:pages', week, 6), topAcross('top:refs', week, 6), topAcross('top:orgs', week, 6), topAcross('top:countries', week, 6),
    recentVisits(Date.now() - 7 * 86_400_000, 200),
  ])
  const now = Date.now()
  const real = visits.filter((v) => !v.bot)
  return NextResponse.json({
    ok: true,
    tz: s.tz,
    days: rows,
    top: { pages, refs, orgs, countries },
    liveNow: real.filter((v) => !v.ended && now - v.last < 5 * 60_000).length,
    visits: real.slice(0, 40).map((v) => ({
      at: v.start, who: v.who, place: [v.city, v.country].filter(Boolean).join(', '), ref: v.ref, score: v.score,
      dur: v.durMs, pages: v.pages.map((p) => p.n), actions: v.actions.map((a) => ACTIONS[a]?.label || a),
      priority: !!(v.target || v.watch || v.via), live: !v.ended && now - v.last < 5 * 60_000, brief: v.brief,
    })),
  })
}

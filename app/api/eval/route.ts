import { NextRequest, NextResponse } from 'next/server'
import { runEval } from '@/lib/pweza/eval'
import { tgConfigured, sendMessage, esc } from '@/lib/alerts/telegram'
import { getSettings } from '@/lib/alerts/settings'

// Daily honesty exam (vercel.json → crons), also callable on demand with the cron secret.

export const runtime = 'nodejs'
export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 })
  const base = process.env.SITE_URL || `https://${req.headers.get('host')}`
  const run = await runEval(base)
  const failed = run.results.filter((r) => !r.pass)
  if (failed.length && tgConfigured()) {
    const s = await getSettings()
    await sendMessage(
      `🧪 <b>PWEZA honesty exam: ${run.passed}/${run.total} passed</b>\n${failed.map((f) => `❌ <b>${esc(f.id)}</b> (${esc(f.reason || '')})\n<i>${esc(f.q)}</i>\n→ ${esc(f.answer.slice(0, 160))}`).join('\n\n')}`,
      { thread: s.topics?.priority, silent: false },
    )
  }
  return NextResponse.json({ ok: true, passed: run.passed, total: run.total, failed: failed.map((f) => ({ id: f.id, reason: f.reason, answer: f.answer })) })
}

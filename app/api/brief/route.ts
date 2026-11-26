import { NextRequest, NextResponse } from 'next/server'
import { saveBrief } from '@/lib/pweza/brief'
import type { Fit } from '@/lib/pweza/jd'
import { validSid } from '@/lib/alerts/live'
import { once } from '@/lib/alerts/store'
import { tgConfigured, sendMessage, esc, SITE } from '@/lib/alerts/telegram'
import { getSettings, isHushed } from '@/lib/alerts/settings'
import { linkChat } from '@/lib/alerts/live'

// Creates a shareable briefing page from a PWEZA conversation (and job fit, if any).
export const runtime = 'nodejs'

const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const sid = validSid(body.sid) ? body.sid : ''
  if (sid && !(await once(`brief:${sid}:${Math.floor(Date.now() / 60_000)}`, 60))) return NextResponse.json({ ok: false, error: 'slow-down' }, { status: 429 })
  const qa = (Array.isArray(body.qa) ? body.qa : []).slice(-12).map((x: any) => ({ q: str(x?.q, 600), a: str(x?.a, 1500) })).filter((x: any) => x.q && x.a)
  const f = body.fit as Fit | undefined
  const fit: Fit | undefined = f && typeof f === 'object' && Array.isArray(f.items) ? {
    role: str(f.role, 90), company: str(f.company, 60) || undefined, score: Math.max(0, Math.min(100, Number(f.score) || 0)), summary: str(f.summary, 400),
    items: f.items.slice(0, 9).map((i: any) => ({ requirement: str(i.requirement, 120), status: ['strong', 'partial'].includes(i.status) ? i.status : 'gap', evidence: str(i.evidence, 200), href: typeof i.href === 'string' && i.href.startsWith('/') ? i.href.slice(0, 120) : undefined })),
    strengths: (f.strengths || []).slice(0, 3).map((x: any) => str(x, 160)), gaps: (f.gaps || []).slice(0, 3).map((x: any) => str(x, 160)),
  } : undefined
  if (!qa.length && !fit) return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 })
  const id = await saveBrief({ qa, fit, company: fit?.company })
  if (!id) return NextResponse.json({ ok: false, error: 'unavailable' })
  const url = `${SITE}/brief/${id}`
  if (tgConfigured()) {
    const s = await getSettings()
    const m = await sendMessage(`📎 <b>A visitor created a briefing to share</b>${fit ? `\n🎯 ${esc(fit.company ? `${fit.company} — ` : '')}${esc(fit.role)} · fit ${fit.score}/100` : ''}\n💬 ${qa.length} question${qa.length === 1 ? '' : 's'} included\n🔗 ${esc(url)}`, {
      thread: s.topics?.priority, silent: isHushed(s), buttons: sid ? [[{ text: '📄 Open briefing', url }, { text: '🎙 Join their chat', callback_data: `live:${sid}` }]] : [[{ text: '📄 Open briefing', url }]],
    })
    if (sid && m.ok && m.result) await linkChat(m.result.message_id, sid)
  }
  return NextResponse.json({ ok: true, id, url })
}

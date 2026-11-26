import { NextRequest, NextResponse } from 'next/server'
import { tgConfigured, sendMessage, sendPhoto, editMessage, hmac, SITE } from '@/lib/alerts/telegram'
import { getSettings, ensureTopics, isHushed } from '@/lib/alerts/settings'
import { clientIp, locate, matchTarget, watchMatch, viaSlug, classifyReferrer, parseUA, crawlerName, leadScore, pageName, ACTIONS, SECTION_LABELS, type Step } from '@/lib/alerts/intel'
import { sendSms } from '@/lib/integrations/sms'
import { intelButton, searchConfigured } from '@/lib/integrations/search'
import { renderVisit, visitButtons, renderLead, renderAction, dur, location, who, type Ctx, type Live } from '@/lib/alerts/format'
import { aiBrief } from '@/lib/alerts/brief'
import { stripUrl } from '@/lib/alerts/strip'
import { saveVisit, countPages, bump, type VisitRecord } from '@/lib/alerts/store'
import { signalsOf, learnedAdjust } from '@/lib/alerts/learn'

// Visitor alerts → Telegram.
// One message per visit that updates live (path, time, scroll, actions), a loud
// ping for high-value actions, an AI read + lead score when they leave, and a
// ⭐ Leads alert for strong visits. Location/company come from the request IP on
// the server; the browser only reports what happened on the page. The server signs
// the visitor context it builds, so later updates can't rewrite who the visitor is.

export const runtime = 'nodejs'
export const maxDuration = 20

type Kind = 'start' | 'update' | 'action' | 'end'
const KINDS: Kind[] = ['start', 'update', 'action', 'end']

// Best-effort per-IP limits (in memory; resets on cold start).
const RATE = new Map<string, { start: number; last: number; count: number; window: number }>()
function limited(ip: string, kind: Kind) {
  if (!ip) return false
  const now = Date.now()
  const r = RATE.get(ip) || { start: 0, last: 0, count: 0, window: now }
  if (now - r.window > 60_000) { r.window = now; r.count = 0 }
  r.count++
  let blocked = r.count > 40
  if (kind === 'start') { if (now - r.start < 4000) blocked = true; else r.start = now }
  if (kind === 'update') { if (now - r.last < 1200) blocked = true; else r.last = now }
  if (RATE.size > 5000) RATE.clear()
  RATE.set(ip, r)
  return blocked
}

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
const int = (v: unknown, min: number, max: number) => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : 0
}

function readLive(body: any, kind: Kind): Live {
  const steps: Step[] = Array.isArray(body.steps)
    ? body.steps.slice(-40).map((x: any) => ({ p: str(x?.p, 160) || '/', d: int(x?.d, 0, 86_400_000), s: int(x?.s, 0, 100) }))
    : []
  return {
    steps,
    actions: Array.isArray(body.actions) ? body.actions.filter((a: unknown) => typeof a === 'string' && ACTIONS[a]).slice(0, 40) : [],
    durMs: int(body.durMs, 0, 86_400_000),
    role: ['recruiter', 'soc', 'engineer'].includes(body.role) ? body.role : null,
    ended: kind === 'end',
    human: body.human === true,
    sections: readSections(body.sections),
  }
}

function readSections(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, ms] of Object.entries(raw as Record<string, unknown>)) {
    if (SECTION_LABELS[id]) out[id] = int(ms, 0, 86_400_000)
  }
  return out
}

function readCtx(body: any): Ctx | null {
  if (typeof body.ctx !== 'string' || body.ctx.length > 8000 || typeof body.sig !== 'string') return null
  if (hmac(body.ctx) !== body.sig) return null
  try { return JSON.parse(body.ctx) as Ctx } catch { return null }
}

async function scoreOf(ctx: Ctx, live: Live) {
  const base = leadScore({
    target: ctx.target, company: ctx.geo.company, ref: ctx.ref, role: live.role, via: ctx.via, watch: ctx.watch,
    durMs: live.durMs, steps: live.steps, actions: live.actions, visits: ctx.visitor.n,
    bot: !!ctx.bot && !live.human,
  })
  if (!base) return 0
  return Math.max(0, Math.min(100, base + (await learnedAdjust(signalsOf(ctx, live)))))
}

function record(ctx: Ctx, live: Live, score: number, msgId: number, brief?: string): VisitRecord {
  return {
    sid: ctx.sid || `${ctx.start}`, start: ctx.start, last: Date.now(), durMs: live.durMs,
    who: who(ctx), company: ctx.geo.company?.name || ctx.geo.org, companyType: ctx.geo.company?.type,
    target: ctx.target || undefined, via: ctx.via, watch: ctx.watch,
    ref: ctx.ref.label, refKind: ctx.ref.kind, role: live.role,
    city: ctx.geo.city, region: ctx.geo.region, country: ctx.geo.country,
    device: ctx.device, visitN: ctx.visitor.n, bot: !!ctx.bot && !live.human,
    pages: live.steps.slice(-30).map((x) => ({ p: x.p, n: pageName(x.p), d: x.d, s: x.s })),
    sections: live.sections || {}, actions: Array.from(new Set(live.actions)),
    score, brief, msgId, ended: live.ended, signals: signalsOf(ctx, live),
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!tgConfigured()) return NextResponse.json({ ok: false, error: 'telegram-not-configured' })
    const body = await req.json().catch(() => ({}))
    const kind = body.type as Kind
    if (!KINDS.includes(kind)) return NextResponse.json({ ok: false, error: 'bad-type' }, { status: 400 })
    const ip = clientIp(req)
    if (limited(ip, kind)) return NextResponse.json({ ok: true, throttled: true })

    const settings = await getSettings()
    const hushed = isHushed(settings)

    // ---------- first page of a visit ----------
    if (kind === 'start') {
      const ua = str(req.headers.get('user-agent'), 400)
      if (crawlerName(ua)) return NextResponse.json({ ok: true, skipped: 'bot' })
      // Automation that runs a real browser but never scrolls, clicks or types stays labelled as a likely bot.
      let botLabel = body.human === true ? '' : body.webdriver === true ? 'automated browser' : ''

      const geo = await locate(req, ip)
      if (geo.hosting && !botLabel) botLabel = 'datacenter network'
      const refRaw = str(body.referrer, 300)
      const ref = classifyReferrer(refRaw, new URL(SITE).hostname)
      const n = int(body.visitor?.n, 1, 9999) || 1
      const ctx: Ctx = {
        v: 1,
        sid: str(body.sid, 40),
        start: Date.now(),
        ip,
        geo,
        device: parseUA(ua),
        screen: str(body.screen, 20),
        lang: str(body.language, 20),
        ref,
        refRaw: ref.kind === 'direct' ? '' : refRaw,
        target: '',
        bot: botLabel,
        visitor: { n, last: int(body.visitor?.last, 0, 9e15) || undefined, first: int(body.visitor?.first, 0, 9e15) || undefined },
        landing: str(body.page, 160) || '/',
      }
      ctx.via = viaSlug(ctx.landing) || undefined
      // A referrer only says who the visitor is when it's an organisation's own site (e.g. an internal wiki
      // or careers page), not when they came from Google, LinkedIn, a job board or social media.
      const orgReferrer = ref.kind === 'site' ? ref.host : ''
      ctx.target = matchTarget(geo, orgReferrer, ctx.via)
      ctx.watch = watchMatch(settings.watch, geo, orgReferrer, ctx.via) || undefined
      const priority = !!(ctx.target || ctx.watch || ctx.via)
      const live = readLive(body, kind)
      const score = await scoreOf(ctx, live)
      const topics = await ensureTopics(settings)
      const thread = topics ? (priority ? topics.priority : topics.visits) : null
      const sent = await sendMessage(renderVisit(ctx, live, score, settings.tz), {
        thread,
        silent: hushed || !priority, // company links, watchlist and target companies buzz on arrival
        buttons: visitButtons(ctx, live),
      })
      if (!sent.ok || !sent.result) return NextResponse.json({ ok: false, error: sent.description || 'send-failed' })
      await saveVisit(record(ctx, live, score, sent.result.message_id), settings.tz, true)
      const packed = JSON.stringify(ctx)
      return NextResponse.json({ ok: true, msgId: sent.result.message_id, ctx: packed, sig: hmac(packed) })
    }

    // ---------- updates within the same visit ----------
    const ctx = readCtx(body)
    const msgId = int(body.msgId, 1, 2 ** 31)
    if (!ctx || !msgId) return NextResponse.json({ ok: false, error: 'restart', restart: true })
    const live = readLive(body, kind)
    const score = await scoreOf(ctx, live)
    let brief = str(body.brief, 400)

    if (kind === 'action') {
      const action = str(body.action, 20)
      if (!ACTIONS[action]) return NextResponse.json({ ok: false, error: 'bad-action' }, { status: 400 })
      if (ACTIONS[action].loud) {
        await sendMessage(renderAction(ctx, action, str(body.page, 160)), { thread: settings.topics?.priority, silent: hushed })
      }
    }

    if (kind === 'end' && body.wantBrief === true && live.durMs > 15_000 && !(ctx.bot && !live.human)) {
      const fresh = await aiBrief({
        visitor: who(ctx),
        knownTargetEmployer: ctx.target || null,
        companyType: ctx.geo.company?.type || null,
        location: location(ctx.geo),
        cameFrom: ctx.ref.label,
        chosenVisitorType: live.role,
        timeOnSite: dur(live.durMs),
        pages: live.steps.map((s) => `${pageName(s.p)} (${dur(s.d)}, scrolled ${s.s}%)`),
        actions: Array.from(new Set(live.actions)).map((a) => ACTIONS[a]?.label.replace(/^\S+\s/, '')),
        visitNumber: ctx.visitor.n,
        device: ctx.device,
        leadScore: score,
      })
      if (fresh) brief = fresh
    }

    await editMessage(msgId, renderVisit(ctx, live, score, settings.tz, brief || undefined), visitButtons(ctx, live))
    const rec = record(ctx, live, score, msgId, brief || undefined)
    await saveVisit(rec, settings.tz, false)
    if (kind === 'end' && !rec.bot) await countPages(rec, settings.tz)

    let lead = false
    if (score >= 70 && body.leadSent !== true && live.durMs >= 45_000 && live.human && (kind === 'end' || score >= 85)) {
      const r = await sendMessage(renderLead(ctx, live, score, brief || undefined), {
        thread: settings.topics?.leads || settings.topics?.priority,
        silent: hushed,
        buttons: [...visitButtons(ctx, live).slice(0, 1), ...(searchConfigured() && orgOf(ctx) ? [[intelButton(orgOf(ctx))]] : [])],
      })
      lead = r.ok
      if (lead) await bump('leads', settings.tz)
      if (lead && score >= 85) await sendSms(`PWEZA hot lead (${score}/100): ${who(ctx).replace(/<[^>]+>/g, '')} spent ${dur(live.durMs)} on your portfolio. Details in Telegram.`, `hot:${ctx.sid}`)
      // A picture of the visit: time per page, scroll depth, sections read.
      if (lead) {
        await sendPhoto(stripUrl(ctx, live, score), `🗺 Visit map · ${who(ctx).replace(/[<>&]/g, '')}`, {
          thread: settings.topics?.leads || settings.topics?.priority, silent: true,
        })
      }
    }
    return NextResponse.json({ ok: true, brief: brief || undefined, lead })
  } catch {
    // never surface internals or fail the visitor's page for an alert problem
    return NextResponse.json({ ok: true, error: 'handled' })
  }
}

/** Employer-looking organisation for a visit (not a consumer ISP). */
function orgOf(ctx: Ctx): string {
  const g = ctx.geo
  return g.company?.name || ctx.target || (g.org && !/comcast|verizon|at&t|spectrum|charter|t-mobile|cox|frontier|centurylink|lumen|xfinity|mobile|wireless|telecom|broadband|cable|amazon|google|microsoft|digitalocean|hosting|cloud/i.test(g.org) ? g.org : '')
}

import { esc, SITE, type Button } from './telegram'
import { ACTIONS, SECTION_LABELS, pageName, type Geo, type Ref, type Step } from './intel'

// Signed, server-built facts about a visitor (the browser echoes it back on updates).
export type Ctx = {
  v: 1
  sid: string
  start: number
  ip: string
  geo: Geo
  device: string
  screen: string
  lang: string
  ref: Ref
  refRaw: string
  target: string
  bot: string
  visitor: { n: number; last?: number; first?: number }
  landing: string
  via?: string
  watch?: string
}

export type Live = { steps: Step[]; actions: string[]; durMs: number; role?: string | null; ended: boolean; human: boolean; sections?: Record<string, number> }

const ROLE_LABEL: Record<string, string> = { recruiter: 'Recruiter / hiring', soc: 'SOC / security lead', engineer: 'Engineer' }

export function flag(cc?: string) {
  if (!cc || !/^[A-Z]{2}$/i.test(cc)) return ''
  return String.fromCodePoint(...cc.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function dur(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60), r = s % 60
  if (m < 60) return r ? `${m}m ${r}s` : `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

const ordinal = (n: number) => { const t = ['th', 'st', 'nd', 'rd'], v = n % 100; return `${n}${t[(v - 20) % 10] || t[v] || t[0]}` }

function ago(ts: number) {
  const d = Date.now() - ts
  const h = d / 3600_000
  if (h < 1) return `${Math.max(1, Math.round(d / 60000))} min ago`
  if (h < 24) return `${Math.round(h)}h ago`
  const days = Math.round(h / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

export function when(ts: number, tz: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric', timeZoneName: 'short' }).format(new Date(ts))
  } catch { return new Date(ts).toUTCString() }
}

function bar(score: number) {
  const n = Math.round(score / 20)
  return '▰'.repeat(n) + '▱'.repeat(5 - n)
}

export function who(ctx: Ctx) {
  const g = ctx.geo
  return ctx.target || (ctx.via ? `/${ctx.via} link` : '') || g.company?.name || g.org || [g.city, g.country].filter(Boolean).join(', ') || 'A visitor'
}

export function location(g: Geo) {
  const parts = [g.city, g.region, g.country].filter(Boolean)
  return parts.length ? `${parts.join(', ')} ${flag(g.country)}`.trim() : 'Unknown'
}

export function renderVisit(ctx: Ctx, live: Live, score: number, tz: string, brief?: string) {
  const g = ctx.geo
  const bot = ctx.bot && !live.human
  const status = live.ended ? ' · <i>left</i>' : ' · <i>browsing now</i>'
  const head = ctx.watch ? `🔥 <b>WATCHLIST · ${esc(ctx.watch)}</b>`
    : ctx.target ? `🔥 <b>PRIORITY · ${esc(ctx.target)}</b>`
    : ctx.via ? `🎯 <b>Opened your /${esc(ctx.via)} link</b>`
    : bot ? `🤖 <b>Likely bot</b> · ${esc(ctx.bot)}`
    : ctx.ref.kind === 'job' ? `💼 <b>Visitor from ${esc(ctx.ref.label)}</b>`
    : '👀 <b>Portfolio visitor</b>'

  const visitBits = [`⭐ Lead score <b>${score}</b>/100 ${bar(score)}`]
  if (ctx.visitor.n > 1) visitBits.push(`👋 ${ordinal(ctx.visitor.n)} visit${ctx.visitor.last ? `, last ${ago(ctx.visitor.last)}` : ''}`)

  const company = g.company
    ? `🏢 ${esc(g.company.name)}${g.company.domain ? ` (${esc(g.company.domain)})` : ''}${g.company.type ? ` · ${esc(g.company.type)}` : ''}`
    : g.org ? `🏢 ${esc(g.org)}` : null

  const from = `🔗 From ${esc(ctx.ref.label)}${live.role ? ` · 🧭 Chose: ${esc(ROLE_LABEL[live.role] || live.role)}` : ''}`

  const pages = new Set(live.steps.map((s) => s.p)).size
  const maxScroll = live.steps.reduce((m, s) => Math.max(m, s.s), 0)
  const time = `⏱ ${dur(live.durMs)} · ${pages} page${pages === 1 ? '' : 's'} · scrolled ${maxScroll}%`

  const steps = live.steps.slice(-8)
  const path = steps.length
    ? `🧭 ${live.steps.length > 8 ? '… → ' : ''}${steps.map((s) => `${esc(pageName(s.p))}${s.d >= 10_000 ? ` <i>(${dur(s.d)})</i>` : ''}`).join(' → ')}`
    : null

  const acts = Array.from(new Set(live.actions)).map((a) => ACTIONS[a]?.label).filter(Boolean)

  const read = Object.entries(live.sections || {})
    .filter(([id, ms]) => SECTION_LABELS[id] && ms >= 3000)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, ms]) => `${SECTION_LABELS[id]} ${dur(ms)}`)

  const flags = [g.vpn && 'VPN', g.proxy && 'Proxy', g.tor && 'Tor', g.hosting && 'Datacenter'].filter(Boolean) as string[]

  return [
    head + status,
    visitBits.join(' · '),
    ctx.via && (ctx.watch || ctx.target) ? `🎯 Came in through <b>/${esc(ctx.via)}</b>` : null,
    '',
    company,
    `📍 ${esc(location(g))}${g.zip ? ` (${esc(g.zip)})` : ''}`,
    from,
    time,
    path,
    read.length ? `📚 Read: ${read.join(' · ')}` : null,
    acts.length ? `⚡ ${acts.join(' · ')}` : null,
    brief ? `\n🧠 <i>${esc(brief)}</i>` : null,
    '',
    `<blockquote expandable>📱 ${esc(ctx.device)}${ctx.screen ? ` · ${esc(ctx.screen)}` : ''}${ctx.lang ? ` · ${esc(ctx.lang)}` : ''}`
      + `\n🌐 ${esc(ctx.ip || 'unknown IP')}${g.asn ? ` · ${esc(g.asn)}` : ''}${g.tz ? ` · ${esc(g.tz)}` : ''}`
      + (flags.length ? `\n🚩 ${esc(flags.join(' · '))}` : '')
      + (ctx.refRaw && ctx.ref.kind !== 'direct' ? `\n↪️ ${esc(ctx.refRaw.slice(0, 120))}` : '')
      + `\n🕐 Arrived ${esc(when(ctx.start, tz))}</blockquote>`,
  ].filter((l) => l !== null).join('\n')
}

export function visitButtons(ctx: Ctx, live: Live): (Button | null)[][] {
  const g = ctx.geo
  const last = live.steps[live.steps.length - 1]?.p || ctx.landing || '/'
  const orgName = g.company?.name || ctx.target || (g.org && !/comcast|verizon|at&t|spectrum|charter|t-mobile|cox|frontier|centurylink|lumen|xfinity|mobile|wireless|telecom|broadband|cable/i.test(g.org) ? g.org : '')
  return [
    [
      g.lat != null && g.lon != null ? { text: '🗺 Map', url: `https://www.google.com/maps?q=${g.lat},${g.lon}` } : null,
      { text: '📄 Page', url: `${SITE}${last}` },
      orgName ? { text: '🔎 LinkedIn', url: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(orgName)}` } : null,
    ],
    [{ text: '✍️ Draft follow-up', callback_data: 'draft' }, { text: '🎓 Prep pack', callback_data: 'prep' }],
    [{ text: '👍 Good lead', callback_data: 'rate:1' }, { text: '👎 Not useful', callback_data: 'rate:-1' }],
    [{ text: '🔕 Mute 1h', callback_data: 'mute:60' }, { text: '🌙 Mute 8h', callback_data: 'mute:480' }],
  ]
}

export function renderLead(ctx: Ctx, live: Live, score: number, brief?: string) {
  const steps = Array.from(new Set(live.steps.map((s) => pageName(s.p)))).slice(0, 6)
  const acts = Array.from(new Set(live.actions)).map((a) => ACTIONS[a]?.label).filter(Boolean)
  return [
    `⭐ <b>Strong lead · score ${score}/100</b>`,
    `🏢 ${esc(who(ctx))} · 📍 ${esc(location(ctx.geo))}`,
    `🔗 ${esc(ctx.ref.label)}${live.role ? ` · 🧭 ${esc(ROLE_LABEL[live.role] || live.role)}` : ''} · ⏱ ${dur(live.durMs)}`,
    steps.length ? `🧭 ${steps.map(esc).join(' → ')}` : null,
    acts.length ? `⚡ ${acts.join(' · ')}` : null,
    brief ? `🧠 <i>${esc(brief)}</i>` : null,
  ].filter(Boolean).join('\n')
}

export function renderAction(ctx: Ctx, action: string, page: string) {
  const label = ACTIONS[action]?.label || action
  return `${label} <b>clicked</b> · ${esc(who(ctx))}\n📍 ${esc(location(ctx.geo))} · on ${esc(pageName(page))}`
}

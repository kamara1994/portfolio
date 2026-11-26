import { esc } from './telegram'
import { dur, flag } from './format'
import { ACTIONS, SECTION_LABELS } from './intel'
import { statsFor, topAcross, lastDays, recentVisits, questionsFor, type DayStats, type VisitRecord } from './store'
import { ask } from './brief'

// /today, /week, /top, the nightly summary and the Sunday weekly report.

const sum = (rows: DayStats[], k: keyof Omit<DayStats, 'day'>) => rows.reduce((a, r) => a + (r[k] as number), 0)
const pct = (now: number, before: number) => (before ? `${now >= before ? '▲' : '▼'} ${Math.abs(Math.round(((now - before) / before) * 100))}%` : now ? '▲ new' : '–')
const list = (rows: [string, number][], fmt = (k: string) => k) => rows.length ? rows.map(([k, n], i) => `${i + 1}. ${esc(fmt(k))} · ${n}`).join('\n') : '—'

function spark(values: number[]) {
  const bars = '▁▂▃▄▅▆▇█'
  const max = Math.max(1, ...values)
  return values.map((v) => bars[Math.min(7, Math.round((v / max) * 7))]).join('')
}

function bestLeads(visits: VisitRecord[], n = 3) {
  return visits.filter((v) => !v.bot && v.score >= 50).sort((a, b) => b.score - a.score).slice(0, n)
}

function leadLine(v: VisitRecord) {
  const acts = v.actions.map((a) => ACTIONS[a]?.label.split(' ')[0]).filter(Boolean).join('')
  const place = [v.city, v.country].filter(Boolean).join(', ')
  return `⭐ <b>${v.score}</b> · ${esc(v.who)}${place ? ` · ${esc(place)} ${flag(v.country)}` : ''} · ${dur(v.durMs)}${acts ? ` · ${acts}` : ''}`
}

async function readTime(visits: VisitRecord[]) {
  const total: Record<string, number> = {}
  for (const v of visits) for (const [id, ms] of Object.entries(v.sections || {})) total[id] = (total[id] || 0) + ms
  return Object.entries(total).filter(([id]) => SECTION_LABELS[id]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, ms]) => `${SECTION_LABELS[id]} ${dur(ms)}`)
}

/** A day's summary (today so far, or a finished day for the nightly report). */
export async function dayReport(tz: string, title: string, endTs = Date.now()) {
  const [day, prev] = lastDays(2, tz, endTs).reverse()
  const [s, sPrev] = await statsFor([day, prev])
  const since = endTs - 26 * 3600_000
  const visits = (await recentVisits(since)).filter((v) => lastDays(1, tz, v.start)[0] === day)
  const [pages, refs, countries, orgs] = await Promise.all([
    topAcross('top:pages', [day], 5), topAcross('top:refs', [day], 4), topAcross('top:countries', [day], 4), topAcross('top:orgs', [day], 4),
  ])
  const leads = bestLeads(visits)
  const read = await readTime(visits)
  return [
    `📊 <b>${esc(title)}</b> · ${day}`,
    '',
    `👀 <b>${s.visits}</b> visitors ${pct(s.visits, sPrev.visits)} · 👋 ${s.returning} returning`,
    `🔥 ${s.priority} priority · ⭐ ${s.leads} strong leads · 💬 ${s.chats} PWEZA chats`,
    `⏱ ${dur(s.timeMs)} total reading time${s.visits ? ` · avg ${dur(s.timeMs / Math.max(1, s.visits))}` : ''}`,
    s.security ? `🛡 ${s.security} security event${s.security > 1 ? 's' : ''} blocked` : null,
    '',
    leads.length ? `<b>Best visitors</b>\n${leads.map(leadLine).join('\n')}` : null,
    orgs.length ? `\n<b>Organisations</b>\n${list(orgs)}` : null,
    pages.length ? `\n<b>Top pages</b>\n${list(pages)}` : null,
    refs.length ? `\n<b>Where they came from</b>\n${list(refs)}` : null,
    countries.length ? `\n<b>Countries</b>\n${list(countries, (c) => `${flag(c)} ${c}`)}` : null,
    read.length ? `\n📚 Most read: ${read.join(' · ')}` : null,
    !s.visits ? 'Quiet day so far.' : null,
  ].filter((l) => l !== null).join('\n')
}

/** 7-day report with trends vs the week before, plus what PWEZA was asked. */
export async function weekReport(tz: string, withAI = true) {
  const days14 = lastDays(14, tz)
  const rows = await statsFor(days14)
  const prev = rows.slice(0, 7), cur = rows.slice(7)
  const week = days14.slice(7)
  const v = sum(cur, 'visits'), vp = sum(prev, 'visits')
  const [pages, refs, orgs, countries] = await Promise.all([
    topAcross('top:pages', week, 5), topAcross('top:refs', week, 5), topAcross('top:orgs', week, 5), topAcross('top:countries', week, 5),
  ])
  const visits = await recentVisits(Date.now() - 7.2 * 86_400_000, 500)
  const leads = bestLeads(visits, 5)
  const read = await readTime(visits)
  let asked = ''
  if (withAI) {
    const qs = await questionsFor(week)
    if (qs.length) {
      asked = await ask(
        'You summarise visitor questions to a portfolio AI assistant for its owner, a cybersecurity job seeker. Group by meaning. Be concise and plain text.',
        `Questions visitors asked this week:\n${qs.slice(0, 150).map((q) => `- ${q}`).join('\n')}\n\nGive: the top 5 themes with a count each (one line each). Then one line starting "Teach:" naming a question worth adding a verified answer for with /teach.`,
        350,
      )
    }
  }
  return [
    `📈 <b>Weekly report</b> · ${week[0]} → ${week[6]}`,
    '',
    `👀 <b>${v}</b> visitors ${pct(v, vp)} vs last week`,
    `<code>${spark(cur.map((r) => r.visits))}</code>  ${week.map((d) => d.slice(8)).join(' ')}`,
    `⭐ ${sum(cur, 'leads')} strong leads ${pct(sum(cur, 'leads'), sum(prev, 'leads'))} · 🔥 ${sum(cur, 'priority')} priority · 💬 ${sum(cur, 'chats')} chats`,
    `⏱ ${dur(sum(cur, 'timeMs'))} reading · 👋 ${sum(cur, 'returning')} returning`,
    sum(cur, 'security') ? `🛡 ${sum(cur, 'security')} security events blocked` : null,
    leads.length ? `\n<b>Best visitors this week</b>\n${leads.map(leadLine).join('\n')}` : null,
    refs.length ? `\n<b>Top sources</b>\n${list(refs)}` : null,
    pages.length ? `\n<b>Most viewed</b>\n${list(pages)}` : null,
    orgs.length ? `\n<b>Organisations</b>\n${list(orgs)}` : null,
    countries.length ? `\n<b>Countries</b>\n${list(countries, (c) => `${flag(c)} ${c}`)}` : null,
    read.length ? `\n📚 Most read: ${read.join(' · ')}` : null,
    asked ? `\n💬 <b>What visitors asked PWEZA</b>\n${esc(asked)}` : null,
  ].filter((l) => l !== null).join('\n')
}

export async function topReport(tz: string) {
  const week = lastDays(30, tz)
  const [pages, refs, orgs] = await Promise.all([topAcross('top:pages', week, 8), topAcross('top:refs', week, 6), topAcross('top:orgs', week, 6)])
  return [
    `${String.fromCodePoint(0x1f3c6)} <b>Top · last 30 days</b>`,
    `\n<b>Pages</b>\n${list(pages)}`,
    `\n<b>Sources</b>\n${list(refs)}`,
    `\n<b>Organisations</b>\n${list(orgs)}`,
  ].join('\n')
}

/** Short spoken script for the voice briefing. */
export async function voiceScript(tz: string) {
  const [day] = lastDays(1, tz)
  const [s] = await statsFor([day])
  const visits = (await recentVisits(Date.now() - 26 * 3600_000)).filter((v) => lastDays(1, tz, v.start)[0] === day)
  const leads = bestLeads(visits, 2)
  const [pages] = await Promise.all([topAcross('top:pages', [day], 1)])
  const parts = [`Good evening Joseph. Here's your portfolio today.`]
  parts.push(s.visits ? `${s.visits} visitor${s.visits === 1 ? '' : 's'}${s.returning ? `, ${s.returning} returning` : ''}.` : 'It was a quiet day, no visitors yet.')
  if (s.leads) parts.push(`${s.leads} strong lead${s.leads === 1 ? '' : 's'}.`)
  for (const l of leads) parts.push(`${l.who}${l.city ? ` from ${l.city}` : ''} scored ${l.score}${l.actions.includes('resume') ? ' and opened your résumé' : ''}.`)
  if (pages[0]) parts.push(`Most viewed was ${pages[0][0]}.`)
  if (s.chats) parts.push(`PWEZA had ${s.chats} conversation${s.chats === 1 ? '' : 's'}.`)
  if (s.security) parts.push(`And I blocked ${s.security} security probe${s.security === 1 ? '' : 's'}.`)
  return parts.join(' ')
}

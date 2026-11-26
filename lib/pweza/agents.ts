import { agentJSON, BIG } from './llm'
import { sourcesBlock } from './retrieve'
import type { Passage } from './corpus'

// 🧠 PWEZA's agent team:
//   Router      — decides which expert answers, spots hiring intent, job posts and language.
//   Experts     — SOC, Cloud, Network, Career, General: same facts, different lens.
//   Fact-checker— reviews the finished answer against the knowledge base and sources,
//                 and corrects any claim the site doesn't support.

export type Expert = 'soc' | 'cloud' | 'network' | 'career' | 'general'
export type Route = { expert: Expert; hiring: boolean; jobPost: boolean; language: string }

const HIRING_RE = /\b(we('| a)re hiring|hiring for|open (role|position|req)|our team|interview (him|joseph)|schedule (a|an) (call|interview)|availability|start date|recruit(er|ing)|job (opening|offer)|salary|compensation|full[- ]time|internship|contract role|send (me )?(his )?r[ée]sum[ée])\b/i
const JOB_RE = /(responsibilit|requirement|qualification|what you('|')?ll do|you will|must have|nice to have|preferred|years of experience|we are looking for|about the role|job description)/gi

export function looksLikeJobPost(text: string) {
  return text.length > 350 && (text.match(JOB_RE) || []).length >= 2
}

function heuristic(text: string): Route {
  const t = text.toLowerCase()
  const expert: Expert = /\b(soc|siem|splunk|triage|alert|incident|detection|threat|phish|blue team|psaa)\b/.test(t) ? 'soc'
    : /\b(aws|cloud|terraform|cloudwatch|guardduty|iam|s3|lambda)\b/.test(t) ? 'cloud'
    : /\b(network|ccna|cisco|ospf|vlan|routing|switch|firewall|packet)\b/.test(t) ? 'network'
    : /\b(hire|hiring|available|availability|fit|role|job|interview|resume|résumé|salary|contact|graduat)\b/.test(t) ? 'career'
    : 'general'
  return { expert, hiring: HIRING_RE.test(text), jobPost: looksLikeJobPost(text), language: 'en' }
}

export async function route(question: string, history: string): Promise<Route> {
  const fallback = heuristic(question)
  if (question.length < 12) return fallback
  const r = await agentJSON<Partial<Route>>(
    `You route messages sent to a portfolio assistant for Joseph (Allan) Kamara, a cybersecurity job seeker.
Return JSON: {"expert": "soc"|"cloud"|"network"|"career"|"general", "hiring": boolean, "jobPost": boolean, "language": ISO-639-1 code of the visitor's message}.
hiring = the visitor appears to be recruiting or evaluating him for a role (mentions openings, interviews, availability, their team, compensation).
jobPost = the message contains a pasted job description.`,
    `Recent conversation:\n${history.slice(-800)}\n\nLatest message:\n${question.slice(0, 1500)}`,
    { maxTokens: 80, timeoutMs: 2500 },
  )
  if (!r) return fallback
  const experts: Expert[] = ['soc', 'cloud', 'network', 'career', 'general']
  return {
    expert: experts.includes(r.expert as Expert) ? (r.expert as Expert) : fallback.expert,
    hiring: !!r.hiring || fallback.hiring,
    jobPost: !!r.jobPost || fallback.jobPost,
    language: typeof r.language === 'string' && /^[a-z]{2}$/.test(r.language) ? r.language : 'en',
  }
}

const LENS: Record<Expert, string> = {
  soc: 'You are answering as PWEZA\'s SOC specialist: think like a SOC lead — detection, triage, response workflow, tooling (Splunk, n8n, Zeek, Suricata), MITRE thinking, and human-in-the-loop containment. Lead with BLUE SOC / BLUE-X evidence and the PSAA cert where relevant.',
  cloud: 'You are answering as PWEZA\'s cloud security specialist: think like a cloud security engineer — IaC, logging, alerting, least privilege. Lead with FORTRESS v2 evidence. Never say the AWS Security Specialty is earned; it is in progress.',
  network: 'You are answering as PWEZA\'s network specialist: routing, switching, VLANs, OSPF, hardening. Lead with the CCNA and the enterprise networking / SALONE AEGIS work.',
  career: 'You are answering as PWEZA\'s career specialist for recruiters and hiring managers: be direct about fit, availability (now, graduating December 2026) and target roles; point to the strongest proof; offer next steps — talking to Joseph live in this chat, his email, or creating a shareable briefing for their hiring team.',
  general: 'You are PWEZA, a sharp, warm guide to Joseph\'s work.',
}

export function expertSystem(base: string, r: Route, sources: Passage[]) {
  return `${base}

${LENS[r.expert]}${r.hiring ? '\nThis visitor seems to be hiring: be concise and concrete about fit, and end by offering to bring Joseph into this chat or to create a briefing they can share.' : ''}
${r.language && r.language !== 'en' ? `\nReply in the visitor's language (${r.language}). Keep project names in English.` : ''}

SOURCES (cite with [n] right after the claim they support; cite at most 3; only cite these; no citation needed for small talk):
${sourcesBlock(sources)}`
}

/** Fact-checker: returns corrected text only when the answer makes unsupported claims about Joseph. */
export async function factCheck(answer: string, knowledge: string, sources: Passage[]): Promise<string | null> {
  if (answer.length < 40) return null
  const r = await agentJSON<{ verdict: 'ok' | 'fix'; problems?: string[]; corrected?: string }>(
    `You are a strict fact-checker for a portfolio assistant. Compare the ANSWER with the KNOWLEDGE and SOURCES.
Flag ONLY specific factual claims about Joseph that are not supported: numbers, tools, employers, dates, certifications (earned vs in progress), project results, or calling lab work "production".
Ignore tone, opinions, suggestions, small talk and offers to connect with Joseph.
Return JSON: {"verdict":"ok"} or {"verdict":"fix","problems":["..."],"corrected":"the full answer rewritten with unsupported claims removed or corrected, same tone and length, keep valid [n] citations"}.`,
    `KNOWLEDGE:\n${knowledge.slice(0, 9000)}\n\nSOURCES:\n${sourcesBlock(sources)}\n\nANSWER:\n${answer}`,
    { model: BIG, maxTokens: 500, timeoutMs: 7000 },
  )
  if (!r || r.verdict !== 'fix' || !r.corrected?.trim()) return null
  return r.corrected.trim()
}

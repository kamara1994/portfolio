import { agentJSON, BIG } from './llm'
import { retrieve, sourcesBlock } from './retrieve'
import { CORPUS } from './corpus'

// 🎯 Job description matcher: a recruiter pastes a job post; PWEZA scores Joseph's fit
// requirement by requirement, linking the evidence and being honest about gaps.

export type FitItem = { requirement: string; status: 'strong' | 'partial' | 'gap'; evidence: string; href?: string }
export type Fit = { role: string; company?: string; score: number; summary: string; items: FitItem[]; strengths: string[]; gaps: string[] }

export async function matchJob(post: string): Promise<Fit | null> {
  const sources = retrieve(post, 12)
  const core = CORPUS.filter((p) => ['identity', 'availability', 'certs'].includes(p.id) && !sources.includes(p))
  const all = [...core, ...sources]
  const r = await agentJSON<any>(
    `You evaluate how well Joseph (Allan) Kamara fits a job, using ONLY the SOURCES (verified facts from his portfolio).
Be honest and specific; never invent experience. Lab projects are labs, not production. An in-progress cert is not earned.
Return JSON:
{"role": string, "company": string|null, "score": 0-100 overall fit for an entry-level candidate,
 "summary": "2 sentences, plain, for a recruiter",
 "items": [{"requirement": short requirement from the post, "status": "strong"|"partial"|"gap", "evidence": "one short line citing what proves it (or what's missing)", "source": number of the best source or null}],
 "strengths": [up to 3 short lines], "gaps": [up to 3 short honest lines, with how he'd close them if the sources show it]}
List 5-9 of the most important requirements.`,
    `SOURCES:\n${sourcesBlock(all)}\n\nJOB POST:\n${post.slice(0, 6000)}`,
    { model: BIG, maxTokens: 1100, timeoutMs: 20000 },
  )
  if (!r || !Array.isArray(r.items)) return null
  const clampStatus = (s: string): FitItem['status'] => (s === 'strong' || s === 'partial' ? s : 'gap')
  return {
    role: String(r.role || 'This role').slice(0, 90),
    company: r.company ? String(r.company).slice(0, 60) : undefined,
    score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
    summary: String(r.summary || '').slice(0, 400),
    items: r.items.slice(0, 9).map((i: any) => {
      const src = Number(i.source) >= 1 ? all[Number(i.source) - 1] : undefined
      return { requirement: String(i.requirement || '').slice(0, 120), status: clampStatus(i.status), evidence: String(i.evidence || '').slice(0, 200), href: src?.href }
    }).filter((i: FitItem) => i.requirement),
    strengths: (r.strengths || []).slice(0, 3).map((x: any) => String(x).slice(0, 160)),
    gaps: (r.gaps || []).slice(0, 3).map((x: any) => String(x).slice(0, 160)),
  }
}

export function fitText(f: Fit) {
  return `${f.company ? `${f.company} — ` : ''}${f.role}: ${f.score}/100 fit. ${f.summary}`
}

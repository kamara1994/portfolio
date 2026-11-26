import { certs, experiences } from '@/data'
import { projects } from '@/data/projects'
import { SKILL_CATEGORIES, PROJECT_NAMES } from '@/data/skills'

// 📚 PWEZA's citable knowledge: every verified fact on the site, split into small
// passages with a link to where a visitor can check it. Retrieval picks the relevant
// passages per question and PWEZA cites them as [1], [2]…

export type Passage = { id: string; title: string; href: string; text: string }

const UNCONFIRMED = /10,000\+|95%\+/
const clean = (x?: string) => (x || '').replace(/\s+/g, ' ').trim()
const verified = (x?: string) => clean(x).split(/(?<=[.!?])\s+/).filter((s) => s && !UNCONFIRMED.test(s)).join(' ')
const EMAIL = 'kamarajosephallan@gmail.com'

function build(): Passage[] {
  const out: Passage[] = []
  const add = (id: string, title: string, href: string, text: string) => { const t = clean(text); if (t) out.push({ id, title, href, text: t }) }

  add('identity', 'About Joseph', '/#story',
    'Joseph Allan Kamara. Allan is his middle name and he also goes by Allan; Joe and Kamara also refer to him. Cybersecurity student and builder focused on SOC automation, AWS cloud security and AI security tools. Based in Philadelphia, Pennsylvania; grew up in Freetown, Sierra Leone.')
  add('availability', 'Availability & contact', '/#contact',
    `B.S. Cybersecurity at BYU-Idaho, graduating December 2026. Available now for full-time roles: SOC Analyst, Security Engineer, Cloud Security, IT / Systems. Email ${EMAIL}. GitHub github.com/kamara1994. LinkedIn linkedin.com/in/joseph-allan-kamara. Résumé available as a PDF on the site.`)
  add('story', 'His story', '/#story',
    'He grew up in Freetown, Sierra Leone, and saw how much daily life depends on infrastructure that works, which is why he cares about keeping real systems running and secure.')

  const earned = certs.filter((c) => c.status === 'earned')
  const pending = certs.filter((c) => c.status !== 'earned')
  add('certs', 'Certifications', '/#credentials',
    `Earned: ${earned.map((c) => `${c.name} (${c.issuer})`).join('; ')}. ${pending.length ? `In progress, not yet earned: ${pending.map((c) => `${c.name} (${c.issuer})`).join('; ')}.` : ''}`)

  experiences.forEach((e, i) => add(`exp-${i}`, `${e.role} · ${e.company}`, '/#experience',
    `${e.role} at ${e.company} (${e.dates}). ${e.bullets.filter((b) => !UNCONFIRMED.test(b)).join(' ')}`))

  for (const p of projects.filter((x) => x.placement)) {
    const href = `/projects/${p.id}`
    const name = PROJECT_NAMES[p.id] ?? p.title
    add(`${p.id}`, name, href, `${name}: ${clean(p.subtitle)}. ${verified(p.description)} Status: ${p.status ?? 'case study'}${p.course ? `, built for ${p.course}` : ''}. Stack: ${p.stack.join(', ')}.${p.github ? ` Code: ${p.github}.` : ''}${p.demo ? ` Live demo: ${p.demo}.` : ''}`)
    add(`${p.id}-problem`, `${name} · problem`, href, `${name} problem: ${verified(p.problem)}`)
    add(`${p.id}-approach`, `${name} · how it was built`, `${href}#architecture`, `${name} approach: ${verified(p.approach)}`)
    add(`${p.id}-result`, `${name} · result`, `${href}#evidence`, `${name} result: ${verified(p.outcome || p.impact)} ${verified(p.impact)}`)
  }

  for (const c of SKILL_CATEGORIES) {
    add(`skills-${c.id}`, `Skills · ${c.title}`, '/#skills',
      `${c.title}: ${c.summary} ${c.skills.map((s) => `${s.name} — ${s.what}${s.projects?.length ? ` (used in ${s.projects.map((id) => PROJECT_NAMES[id] ?? id).join(', ')})` : ''}${s.certs?.length ? ` (cert: ${s.certs.join(', ')})` : ''}`).join('; ')}`)
  }
  return out
}

export const CORPUS: Passage[] = build()

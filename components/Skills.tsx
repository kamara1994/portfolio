'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SKILL_CATEGORIES, PROJECT_NAMES, type Skill } from '@/data/skills'
import { useRole } from './roles'

const ALL = SKILL_CATEGORIES.flatMap((c) => c.skills)
const TOTAL = ALL.length
const IN_PROJECTS = ALL.filter((s) => s.projects?.length).length
const CERT_COUNT = new Set(ALL.flatMap((s) => s.certs ?? [])).size
const ROLE_CATEGORY: Record<string, string> = { recruiter: 'secops', soc: 'secops', engineer: 'cloud' }

const ICONS: Record<string, string> = {
  shield: '🛡️', cloud: '☁️', radar: '📡', network: '🌐', target: '🎯', spark: '🤖', code: '💻', book: '📚',
}

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span aria-hidden className={`emoji ${className}`}>{ICONS[name]}</span>
}

function evidenceLabel(s: Skill) {
  if (s.projects?.length && s.certs?.length) return { text: 'Built and certified', cls: 'ev-both' }
  if (s.projects?.length) return { text: 'Built with', cls: 'ev-built' }
  return { text: 'Certified', cls: 'ev-cert' }
}

export default function Skills() {
  const [active, setActive] = useState(SKILL_CATEGORIES[0].id)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const role = useRole()
  useEffect(() => { if (role && ROLE_CATEGORY[role]) setActive(ROLE_CATEGORY[role]) }, [role])

  const onKey = (e: React.KeyboardEvent) => {
    const i = SKILL_CATEGORIES.findIndex((c) => c.id === active)
    const n = SKILL_CATEGORIES.length
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    const j = (to + n) % n
    setActive(SKILL_CATEGORIES[j].id)
    tabs.current[j]?.focus()
  }
  const cat = SKILL_CATEGORIES.find((c) => c.id === active)!
  const built = cat.skills.filter((s) => s.projects?.length).length

  return (
    <section id="skills" className="lazy-section border-t border-line">
      <div className="wrap py-16 md:py-32">
        <p className="text-[clamp(18px,1.4vw,22px)] font-medium text-signal">Applied skills</p>
        <h2 className="mt-3 font-display text-[clamp(38px,4.4vw,68px)] font-bold uppercase leading-[0.95]">
          Skills with <span className="title-accent">proof</span>
        </h2>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-smoke">
          Every skill links to where I used it or the certification that covers it.
        </p>
        <dl className="sk-stats mt-8">
          <div><dt>Skills</dt><dd>{TOTAL}</dd></div>
          <div><dt>Used in real projects</dt><dd>{IN_PROJECTS}</dd></div>
          <div><dt>Certifications behind them</dt><dd>{CERT_COUNT}</dd></div>
        </dl>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Categories */}
          <div role="tablist" aria-label="Skill categories" aria-orientation="vertical" onKeyDown={onKey} className="sk-tabs -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:col-span-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {SKILL_CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => { tabs.current[i] = el }}
                tabIndex={c.id === active ? 0 : -1}
                role="tab"
                aria-selected={c.id === active}
                aria-controls="skill-panel"
                onClick={() => setActive(c.id)}
                className={`sk-cat ${c.id === active ? 'is-active' : ''}`}
              >
                <span className="sk-cat-icon"><Icon name={c.icon} className="h-[18px] w-[18px]" /></span>
                <span className="text-left">
                  <span className="sk-cat-title block whitespace-nowrap text-[15px] font-semibold">{c.title}</span>
                  <span className="sk-cat-count block text-[12px] text-smoke">{c.skills.length} skills</span>
                </span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div id="skill-panel" role="tabpanel" className="lg:col-span-8">
            <div key={cat.id} className="sk-panel-in">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
                <div className="flex items-center gap-4">
                  <span className="sk-cat-icon sk-panel-icon h-12 w-12 text-[22px]"><Icon name={cat.icon} /></span>
                  <div>
                    <h3 className="font-display text-[clamp(26px,2.4vw,36px)] font-bold uppercase leading-none">{cat.title}</h3>
                    <p className="mt-1.5 text-[15px] text-smoke">{cat.summary}</p>
                  </div>
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6FD6FF]">
                  {built} of {cat.skills.length} used in projects
                </p>
              </div>

              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {cat.skills.map((s) => {
                  const ev = evidenceLabel(s)
                  return (
                    <li key={s.name} className="sk-card">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[17px] font-semibold leading-snug text-snow">{s.name}</p>
                        <span className={`sk-ev ${ev.cls}`}>{ev.text}</span>
                      </div>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-smoke">{s.what}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.projects?.map((p) => (
                          <Link key={p} href={`/projects/${p}`} className="sk-proof sk-proof-link">
                            {PROJECT_NAMES[p] ?? p}
                          </Link>
                        ))}
                        {s.certs?.map((c) => (
                          <span key={c} className="sk-proof">{c}</span>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

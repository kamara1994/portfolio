'use client'
import Link from 'next/link'
import { projects } from '@/data/projects'
import ProjectMedia from './ProjectMedia'
import { RESUME } from './Nav'
import { useEffect, useRef, useState } from 'react'
import { ROLES, RoleIcon, chooseRole, useRole } from './roles'

const FIRST = 3
/** Strongest, evidence-backed projects lead by default (a chosen reader role re-sorts them). */
const LEAD = ['blue-soc-p8', 'fortress-v2', 'blue-x']
const leadRank = (id: string) => { const i = LEAD.indexOf(id); return i === -1 ? 99 : i }

const flagshipAll = projects.filter((p) => p.placement === 'flagship')

/** Split a title into the name and its version-like ending (P8, v2, X) for the color accent. */
function splitTitle(t: string): [string, string] {
  const dash = t.match(/^(.*-)([A-Z0-9]{1,3})$/)
  if (dash) return [dash[1], dash[2]]
  const last = t.match(/^(.*\s)([A-Za-z]?\d[\w.]*)$/)
  if (last) return [last[1], last[2]]
  return [t, '']
}
/** "Main — detail" subtitles: show the detail as a quiet second line instead of an em dash. */
function splitSub(t: string): [string, string] {
  const i = t.indexOf(' — ')
  return i === -1 ? [t, ''] : [t.slice(0, i), t.slice(i + 3)]
}
const more = projects.filter((p) => p.placement === 'more')
/** Split the impact text after its first sentence so the headline result can be shown brighter. */
function lead(t: string): [string, string] {
  const m = t.match(/^(.+?[.!?])\s+(?=[A-Z])/)
  return m ? [m[1], t.slice(m[0].length)] : [t, '']
}

export default function Work() {
  const role = useRole()
  const [all, setAll] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  // Collapsed projects stay in the page for search engines but can't be tabbed into (React 18 lacks the inert prop).
  useEffect(() => { if (panel.current) panel.current.inert = !all }, [all])
  const current = ROLES.find((r) => r.id === role)
  const rank = (id: string) => {
    const i = current ? current.order.indexOf(id) : -1
    return i === -1 ? 99 : i
  }
  const flagship = current ? [...flagshipAll].sort((a, b) => rank(a.id) - rank(b.id)) : [...flagshipAll].sort((a, b) => leadRank(a.id) - leadRank(b.id))
  const extra = [...flagship.slice(FIRST), ...more]
  const toggle = () => {
    if (all) document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setAll((v) => !v)
  }

  return (
    <section id="work" aria-label="Work">
      {current && (
        <div className="wrap project-wrap pt-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-panel/70 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raised text-signal">
              <RoleIcon role={current.id} />
            </span>
            <p className="text-[15px] text-snow/90">
              Showing my work for a <span className="font-semibold text-snow">{current.label}</span>: {current.blurb.toLowerCase()}.
            </p>
            <div className="flex gap-5 text-[14px] md:ml-auto">
              {current.id === 'recruiter' && (
                <>
                  <Link href="/recruiter" className="text-signal hover:text-snow">One-page summary</Link>
                  <a href={RESUME} target="_blank" rel="noopener" className="text-signal hover:text-snow">Download résumé</a>
                </>
              )}
              <button type="button" onClick={() => chooseRole(null)} className="text-smoke hover:text-snow">Show everything</button>
            </div>
          </div>
        </div>
      )}
      <div id="featured-projects" className="wrap project-wrap scroll-mt-24 pt-12 md:pt-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-signal">Selected work</p>
        <h2 className="mt-2 font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">
          Featured <span className="title-accent">projects</span>
        </h2>
      </div>
      {flagship.slice(0, FIRST).map((p, i) => (
        <article key={p.id} className="wrap project-wrap py-4 md:py-6">
          <div className="hud-frame project-card grid items-center gap-5 p-5 sm:p-7 lg:grid-cols-12 lg:gap-8 lg:p-8">
            <span aria-hidden className="hud-corner tl" /><span aria-hidden className="hud-corner tr" />
            <span aria-hidden className="hud-corner bl" /><span aria-hidden className="hud-corner br" />
            <div className={`min-w-0 lg:col-span-5 ${i % 2 ? 'lg:order-2' : ''}`}>
              <p className="text-[15px] text-smoke">{p.category}</p>
              <div className="card-title-row mt-3">
                <h3 className="font-display text-[clamp(32px,3.5vw,56px)] font-bold uppercase leading-[0.9]">
                  {splitTitle(p.title)[0]}
                  {splitTitle(p.title)[1] && <span className="title-accent">{splitTitle(p.title)[1]}</span>}
                </h3>
                {/* Phone: the main action sits beside the project name */}
                <Link href={`/projects/${p.id}`} className="btn-primary card-title-btn card-actions sm:hidden">How it works</Link>
              </div>
              <p className="mt-3 max-w-[46ch] text-[17px] leading-relaxed text-snow/85">{splitSub(p.subtitle)[0]}</p>
              {splitSub(p.subtitle)[1] && <p className="mt-1 text-[15px] text-smoke">{splitSub(p.subtitle)[1]}</p>}
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-smoke"><span className="card-result">{lead(p.impact)[0]}</span>{lead(p.impact)[1] && <> {lead(p.impact)[1]}</>}</p>
              <p className="mt-3 hidden text-[13px] leading-relaxed text-smoke sm:block">
                {p.stack.slice(0, 6).join(', ')}
              </p>
              <div className={`btn-row card-actions card-btns mt-5 ${!p.sourceAccess || p.demo ? '' : 'max-sm:hidden'}`}>
                <Link href={`/projects/${p.id}`} className="btn-primary max-sm:hidden">How it works</Link>
                {!p.sourceAccess && <Link href={`/projects/${p.id}#source-code`} className="btn-ghost">View source code</Link>}
                {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn-ghost">Live demo</a>}
              </div>
              {p.sourceAccess && <p className="mb-4 mt-3 text-sm text-smoke">{p.sourceAccess === 'private' ? 'Private source · available on request' : 'Source not published'}</p>}
            </div>

            <div className={`order-first min-w-0 lg:col-span-7 ${i % 2 ? 'lg:order-1' : 'lg:order-none'}`}>
              <div className="relative mx-auto aspect-video w-full max-w-[700px] overflow-hidden rounded-lg border border-line bg-panel">
                <ProjectMedia project={p} priority={i === 0} controls={false} />
              </div>
            </div>
            <Link href={`/projects/${p.id}`} className="card-link" aria-label={`Open ${p.title}`} />
          </div>
        </article>
      ))}

      {extra.length > 0 && (
        <div className="wrap project-wrap pb-10 pt-4">
          <div className="more-toggle-row">
            <button type="button" className="more-toggle" aria-expanded={all} aria-controls="more-projects" onClick={toggle}>
              <span>{all ? 'Show fewer projects' : `Show ${extra.length} more projects`}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="more-caret"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {!all && <p className="more-teaser">{extra.map((p) => p.title).join(' · ')} · <Link href="/projects" className="more-library">Full project library <span aria-hidden="true">↗</span></Link></p>}
          </div>

          <div id="more-projects" className="more-panel" data-open={all} ref={panel}>
            <div className="more-panel-inner">
              <ul className="divide-y divide-line border-y border-line">
                {extra.map((p) => (
                  <li key={p.id}>
                    <div className="project-card project-row grid gap-5 py-5 md:grid-cols-12 md:items-center md:px-4">
                      <div className="relative aspect-video w-full max-w-[420px] overflow-hidden rounded-lg border border-line bg-panel md:col-span-4"><ProjectMedia project={p} controls={false} /></div>
                      <div className="md:col-span-8">
                        <p className="text-[14px] text-smoke">{p.category}</p>
                        <h3 className="mt-1"><Link href={`/projects/${p.id}`} className="card-actions font-display text-[28px] font-semibold uppercase leading-tight hover:text-signal">{p.title}</Link></h3>
                        <p className="mt-2 text-smoke">{splitSub(p.subtitle)[0]}</p>
                        <div className="card-actions mt-4 flex flex-wrap items-center gap-4 text-sm">
                          <Link href={`/projects/${p.id}`} className="text-signal">How it works</Link>
                          {!p.sourceAccess && <Link href={`/projects/${p.id}#source-code`} className="text-signal">View source code</Link>}
                          {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="text-signal">Live demo</a>}
                          {p.sourceAccess && <span className="text-smoke">{p.sourceAccess === 'private' ? 'Private source · available on request' : 'Source not published'}</span>}
                        </div>
                      </div>
                      <Link href={`/projects/${p.id}`} className="card-link" aria-label={`Open ${p.title}`} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="more-library-row">
                <Link href="/projects" className="more-library-cta">Explore the full project library <span aria-hidden="true">↗</span></Link>
                <p>Coursework labs in AWS, networking and security, with evidence and limitations.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

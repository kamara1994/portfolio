'use client'
import Link from 'next/link'
import { projects } from '@/data/projects'
import ProjectMedia from './ProjectMedia'
import { RESUME } from './Nav'
import { ROLES, RoleIcon, chooseRole, useRole } from './roles'

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

export default function Work() {
  const role = useRole()
  const current = ROLES.find((r) => r.id === role)
  const rank = (id: string) => {
    const i = current ? current.order.indexOf(id) : -1
    return i === -1 ? 99 : i
  }
  const flagship = current ? [...flagshipAll].sort((a, b) => rank(a.id) - rank(b.id)) : flagshipAll

  return (
    <section id="work" aria-label="Work">
      {current && (
        <div className="wrap pt-8">
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
      {flagship.map((p, i) => (
        <article key={p.id} className="wrap max-w-[1300px] py-4 md:py-6">
          <div className="hud-frame grid items-center gap-5 p-5 sm:p-7 lg:grid-cols-12 lg:gap-8 lg:p-8">
            <span aria-hidden className="hud-corner tl" /><span aria-hidden className="hud-corner tr" />
            <span aria-hidden className="hud-corner bl" /><span aria-hidden className="hud-corner br" />
            <div className={`min-w-0 lg:col-span-5 ${i % 2 ? 'lg:order-2' : ''}`}>
              <p className="text-[15px] text-smoke">{p.category}</p>
              <h2 className="mt-3 font-display text-[clamp(32px,3.5vw,56px)] font-bold uppercase leading-[0.9]">
                {splitTitle(p.title)[0]}
                {splitTitle(p.title)[1] && <span className="title-accent">{splitTitle(p.title)[1]}</span>}
              </h2>
              <p className="mt-3 max-w-[46ch] text-[17px] leading-relaxed text-snow/85">{splitSub(p.subtitle)[0]}</p>
              {splitSub(p.subtitle)[1] && <p className="mt-1 text-[15px] text-smoke">{splitSub(p.subtitle)[1]}</p>}
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-smoke">{p.impact}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-smoke">
                {p.stack.slice(0, 6).join(', ')}
              </p>
              <div className="btn-row mt-5 flex flex-wrap gap-3">
                <Link href={`/projects/${p.id}`} className="btn-primary">How it works</Link>
                <Link href={`/projects/${p.id}#source-code`} className="btn-ghost">View source code</Link>
                {p.sourceAccess && <span className="self-center text-sm text-smoke">{p.sourceAccess === 'private' ? 'Private source · available on request' : 'Source not published'}</span>}
                {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn-ghost">Live demo</a>}
              </div>
            </div>

            <div className={`order-first min-w-0 lg:col-span-7 ${i % 2 ? 'lg:order-1' : 'lg:order-none'}`}>
              <div className="relative mx-auto aspect-video w-full max-w-[700px] overflow-hidden rounded-lg border border-line bg-panel">
                <ProjectMedia project={p} priority={i === 0} />
              </div>
            </div>
          </div>
        </article>
      ))}

      {more.length > 0 && (
        <div className="border-t border-line">
          <div className="wrap max-w-[1300px] py-12 md:py-16">
            <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">More <span className="title-accent">work</span></h2>
            <ul className="mt-7 divide-y divide-line border-y border-line">
              {more.map((p) => (
                <li key={p.id}>
                  <div className="grid gap-5 py-5 md:grid-cols-12 md:items-center md:px-4">
                    <div className="relative aspect-video w-full max-w-[420px] overflow-hidden rounded-lg border border-line bg-panel md:col-span-4"><ProjectMedia project={p} /></div>
                    <div className="md:col-span-8">
                      <Link href={`/projects/${p.id}`} className="font-display text-[28px] font-semibold uppercase leading-tight hover:text-signal">{p.title}</Link>
                      <p className="mt-2 text-smoke">{p.subtitle}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <Link href={`/projects/${p.id}`} className="text-signal">How it works</Link>
                        <Link href={`/projects/${p.id}#source-code`} className="text-signal">View source code</Link>
                        {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="text-signal">Live demo</a>}
                        {p.sourceAccess && <span className="text-smoke">{p.sourceAccess === 'private' ? 'Private source · available on request' : 'Source not published'}</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

'use client'
import Link from 'next/link'
import { projects } from '@/data/projects'
import ProjectMedia from './ProjectMedia'
import { ROLES, useRole } from './role'

const flagshipAll = projects.filter((p) => p.placement === 'flagship')
const more = projects.filter((p) => p.placement === 'more')

export default function Work() {
  const { role } = useRole()
  const rank = (id: string) => {
    const i = ROLES[role].order.indexOf(id)
    return i === -1 ? 99 : i
  }
  const flagship = [...flagshipAll].sort((a, b) => rank(a.id) - rank(b.id))
  return (
    <section id="work" aria-label="Work">
      {flagship.map((p, i) => (
        <article key={p.id} className="border-t border-line">
          <div className="wrap grid min-h-[100svh] content-center gap-10 py-20 md:grid-cols-12 md:gap-12 md:py-28">
            <div className={`md:col-span-5 md:self-end ${i % 2 ? 'md:order-2' : ''}`}>
              <p className="text-[15px] text-smoke">{p.category}</p>
              <h2 className="mt-3 font-display text-[clamp(44px,6vw,92px)] font-bold uppercase leading-[0.9]">
                {p.title}
              </h2>
              <p className="mt-6 max-w-[40ch] text-[19px] leading-relaxed text-snow/85">{p.subtitle}</p>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-smoke">{p.impact}</p>
              <p className="mt-6 text-[14px] leading-relaxed text-smoke">
                {p.stack.slice(0, 6).join(', ')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/projects/${p.id}`} className="btn-primary">How it works</Link>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener" className="btn-ghost">View code</a>
                )}
              </div>
            </div>

            <div className={`order-first md:col-span-7 ${i % 2 ? 'md:order-1' : 'md:order-none'}`}>
              <div className="relative aspect-[16/10] overflow-hidden border border-line bg-panel">
                <ProjectMedia project={p} priority={i === 0} />
              </div>
            </div>
          </div>
        </article>
      ))}

      {more.length > 0 && (
        <div className="border-t border-line">
          <div className="wrap py-24 md:py-32">
            <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">More work</h2>
            <ul className="mt-12 divide-y divide-line border-y border-line">
              {more.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="group grid gap-2 py-7 transition-colors hover:bg-panel md:grid-cols-12 md:items-baseline md:gap-8 md:px-4"
                  >
                    <span className="font-display text-[28px] font-semibold uppercase leading-tight md:col-span-4">
                      {p.title}
                    </span>
                    <span className="text-[16px] leading-relaxed text-snow/80 md:col-span-6">{p.subtitle}</span>
                    <span className="text-[15px] text-smoke md:col-span-2 md:text-right">{p.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

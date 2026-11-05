import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects, type Project } from '@/data/projects'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProjectMedia from '@/components/ProjectMedia'

const shown = projects.filter((p) => p.placement)

const STATUS: Record<NonNullable<Project['status']>, string> = {
  'lab-validated': 'Validated in a controlled lab',
  'live-demo': 'Live',
  'case-study': 'Case study',
  'in-development': 'In development',
  verified: 'Running in production',
}

export function generateStaticParams() {
  return shown.map((p) => ({ slug: p.id }))
}
export const dynamicParams = false

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = shown.find((x) => x.id === params.slug)
  return p ? { title: `${p.title} | Joseph Allan Kamara`, description: p.subtitle } : {}
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const idx = shown.findIndex((x) => x.id === params.slug)
  if (idx === -1) notFound()
  const p = shown[idx]
  const next = shown[(idx + 1) % shown.length]

  const facts = [
    ['Role', p.role],
    ['When', p.duration],
    ['Status', p.status ? STATUS[p.status] : undefined],
  ].filter((f): f is [string, string] => Boolean(f[1]))

  return (
    <>
      <Nav />
      <main>
        <header className="wrap pb-14 pt-36 md:pt-44">
          <Link href="/#work" className="text-[15px] text-smoke hover:text-snow">Back to all work</Link>
          <p className="mt-10 text-[15px] text-smoke">{p.category}</p>
          <h1 className="mt-3 font-display text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.88]">{p.title}</h1>
          <p className="mt-6 max-w-[44ch] text-[clamp(19px,1.8vw,24px)] leading-snug text-snow/85">{p.subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {p.demo && <a href={p.demo} target="_blank" rel="noopener" className="btn-primary">Open live demo</a>}
            {p.github && <a href={p.github} target="_blank" rel="noopener" className={p.demo ? 'btn-ghost' : 'btn-primary'}>View code</a>}
            {p.report && <a href={p.report} className="btn-ghost">Download report</a>}
          </div>
        </header>

        <div className="wrap">
          <div className="relative aspect-[16/9] overflow-hidden border border-line bg-panel">
            <ProjectMedia project={p} priority />
          </div>
        </div>

        <section className="wrap grid gap-14 py-20 md:grid-cols-12 md:py-28">
          <dl className="space-y-6 md:col-span-4">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[14px] text-smoke">{k}</dt>
                <dd className="mt-1 text-[17px]">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[14px] text-smoke">Built with</dt>
              <dd className="mt-1 text-[17px] leading-relaxed">{p.stack.join(', ')}</dd>
            </div>
          </dl>

          <div className="space-y-14 md:col-span-7 md:col-start-6">
            <p className="text-[20px] leading-relaxed text-snow/90">{p.description}</p>
            {[
              ['The problem', p.problem],
              ['What I built', p.approach],
              ['Result', p.outcome],
            ].map(([h, body]) => (
              <div key={h}>
                <h2 className="font-display text-[32px] font-bold uppercase leading-none">{h}</h2>
                <p className="mt-4 text-[17px] leading-[1.7] text-snow/80">{body}</p>
              </div>
            ))}
            {p.architecture && (
              <div>
                <h2 className="font-display text-[32px] font-bold uppercase leading-none">How data flows</h2>
                <ol className="mt-6 divide-y divide-line border-y border-line">
                  {p.architecture.map((step, i) => (
                    <li key={step} className="grid grid-cols-[2.5rem_1fr] py-4 text-[16px] leading-relaxed text-snow/85">
                      <span className="text-smoke">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>

        <Link href={`/projects/${next.id}`} className="group block border-t border-line transition-colors hover:bg-panel">
          <div className="wrap py-16 md:py-24">
            <p className="text-[15px] text-smoke">Next project</p>
            <p className="mt-3 font-display text-[clamp(40px,6vw,88px)] font-bold uppercase leading-none">{next.title}</p>
          </div>
        </Link>
      </main>
      <Footer />
    </>
  )
}

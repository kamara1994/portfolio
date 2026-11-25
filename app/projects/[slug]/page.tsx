import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects, type Project } from '@/data/projects'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProjectMedia from '@/components/ProjectMedia'
import ProjectSource from '@/components/ProjectSource'
import NextProjectTitle, { ProjectTitleArt, TitleMotionControl } from '@/components/NextProjectTitle'

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
        <header className="wrap project-wrap pb-7 pt-28 md:pt-32">
          <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/#work" className="tap text-[15px] text-smoke hover:text-snow">Back to all work</Link><TitleMotionControl /></div>
          <div className="mt-5 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-5">
              <p className="text-[15px] text-smoke">{p.category}</p>
              <h1 className="mt-3 font-display text-[clamp(38px,5vw,76px)] font-bold uppercase leading-[0.88]"><ProjectTitleArt title={p.title} projectId={p.id} /></h1>
              <p className="mt-4 max-w-[60ch] text-[clamp(19px,1.8vw,24px)] leading-snug text-snow/85">{p.subtitle}</p>
              <div className="btn-row mt-5 flex flex-wrap gap-3">
                {p.demo && <a href={p.demo} target="_blank" rel="noopener" className="btn-primary">Open live demo</a>}
                <a href="#source-code" className={p.demo ? 'btn-ghost' : 'btn-primary'}>View source code</a>
                {p.report && <a href={p.report} className="btn-ghost">Download report</a>}
              </div>
              <p className="mt-6 text-[18px] leading-relaxed text-snow/90">{p.description}</p>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-panel">
                <ProjectMedia project={p} priority />
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-[14px] text-smoke">{k}</dt>
                    <dd className="mt-1 text-[16px] leading-relaxed">{v}</dd>
                  </div>
                ))}
                <div className="sm:col-span-3">
                  <dt className="text-[14px] text-smoke">Built with</dt>
                  <dd className="mt-1 text-[16px] leading-relaxed">{p.stack.join(', ')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <section className="wrap project-wrap py-10 md:py-14">
          <div className="min-w-0 space-y-9">
            <div className="grid gap-8 lg:grid-cols-3">
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
            </div>
            <ProjectSource project={p} />
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

        <div className="group border-t border-line transition-colors hover:bg-panel">
          <div className="wrap project-wrap py-10 md:py-14">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[15px] text-smoke">Next project</p><TitleMotionControl /></div>
            <Link href={`/projects/${next.id}`} className="block"><NextProjectTitle title={next.title} projectId={next.id} /></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

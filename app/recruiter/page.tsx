import type { Metadata } from 'next'
import Link from 'next/link'
import { certs, experiences } from '@/data'
import { projects } from '@/data/projects'
import { RESUME } from '@/components/Nav'
import { EMAIL, LINKEDIN, GITHUB } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Recruiter summary | Joseph Allan Kamara',
  description: 'One-page summary: target roles, certifications, top projects, experience, and contact.',
}

const ROLES = ['SOC Analyst', 'Security Engineer', 'Cloud Security', 'IT / Systems']
const flagship = projects.filter((p) => p.placement === 'flagship').slice(0, 3)
const UNCONFIRMED_FIGURES = /10,000\+|95%\+/

export default function RecruiterPage() {
  return (
    <main className="wrap pb-16 pt-10 md:pt-14 print:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href="/" className="text-[15px] text-smoke hover:text-snow">Back to full portfolio</Link>
        <div className="flex gap-3">
          <a href={`mailto:${EMAIL}`} className="btn-primary">Email Joseph</a>
          <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost">Résumé</a>
        </div>
      </div>

      <header className="mt-10 grid gap-6 border-b border-line pb-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="flex items-center gap-2.5 text-[15px] text-[#4BE3C8]"><span aria-hidden className="status-dot" /> Open to full-time roles</p>
          <h1 className="mt-3 font-display text-[clamp(44px,6vw,84px)] font-bold uppercase leading-[0.9]">
            Joseph Allan <span className="title-accent">Kamara</span>
          </h1>
          <p className="mt-4 text-[18px] text-snow/85">B.S. Cybersecurity, BYU-Idaho, graduating December 2026. Based in Philadelphia, open to remote.</p>
        </div>
        <dl className="grid gap-1 text-[15px] md:col-span-4 md:text-right">
          <div><dt className="sr-only">Email</dt><dd><a href={`mailto:${EMAIL}`} className="text-[#8AD4FF] hover:text-white">{EMAIL}</a></dd></div>
          <div><dt className="sr-only">LinkedIn</dt><dd><a href={LINKEDIN} target="_blank" rel="noopener" className="text-snow/80 hover:text-white">linkedin.com/in/joseph-allan-kamara</a></dd></div>
          <div><dt className="sr-only">GitHub</dt><dd><a href={GITHUB} target="_blank" rel="noopener" className="text-snow/80 hover:text-white">github.com/kamara1994</a></dd></div>
        </dl>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <h2 className="rs-h">Target roles</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{ROLES.map((r) => <li key={r} className="sk-proof">{r}</li>)}</ul>

          <h2 className="rs-h mt-8">Certifications</h2>
          <ul className="mt-3 space-y-2 text-[15.5px]">
            {certs.map((c) => (
              <li key={c.name} className="flex justify-between gap-4">
                <span className="text-snow">{c.name}</span>
                <span className={c.status === 'earned' ? 'text-[#4BE3C8]' : 'text-smoke'}>{c.status === 'earned' ? 'Earned' : 'In progress'}</span>
              </li>
            ))}
          </ul>

          <h2 className="rs-h mt-8">Experience</h2>
          <ul className="mt-3 space-y-3 text-[15.5px]">
            {experiences.map((e) => (
              <li key={e.role + e.company}>
                <p className="font-semibold text-snow">{e.role}</p>
                <p className="text-smoke">{e.company}, {e.dates}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-8">
          <h2 className="rs-h">Top projects</h2>
          <ul className="mt-3 grid gap-4">
            {flagship.map((p) => (
              <li key={p.id} className="sk-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-[26px] font-bold uppercase leading-none">{p.title}</p>
                  <p className="text-[13px] text-smoke">{p.category}</p>
                </div>
                <p className="mt-2 text-[15.5px] leading-relaxed text-snow/85">{p.impact}</p>
                <p className="mt-2 text-[13.5px] text-smoke">{p.stack.slice(0, 6).join(', ')}</p>
                <div className="mt-3 flex gap-2 print:hidden">
                  <Link href={`/projects/${p.id}`} className="sk-proof sk-proof-link">Case study</Link>
                  {p.github && <a href={p.github} target="_blank" rel="noopener" className="sk-proof sk-proof-link">Code</a>}
                </div>
              </li>
            ))}
          </ul>

          <h2 className="rs-h mt-8">Highlights</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15.5px] leading-relaxed text-snow/85 marker:text-[#6FD6FF]">
            {experiences.flatMap((e) => e.bullets).filter((b) => !UNCONFIRMED_FIGURES.test(b)).slice(0, 4).map((b) => <li key={b}>{b}</li>)}
          </ul>
        </section>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadBrief } from '@/lib/pweza/brief'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Candidate briefing · Joseph Allan Kamara', robots: { index: false, follow: false } }

const STATUS = { strong: { label: 'Strong', cls: 'ok' }, partial: { label: 'Partial', cls: 'mid' }, gap: { label: 'Gap', cls: 'gap' } } as const
const cite = (t: string) => t.replace(/\s*\[\d+\]/g, '')

export default async function BriefPage({ params }: { params: { id: string } }) {
  const b = await loadBrief(params.id)
  if (!b) notFound()
  const date = new Date(b.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <main className="brief">
      <header className="brief-head">
        <p className="brief-kicker">Candidate briefing · {date}</p>
        <h1>Joseph Allan Kamara</h1>
        <p className="brief-sub">Cybersecurity · SOC automation · AWS cloud security · AI security tools. B.S. Cybersecurity, BYU-Idaho (Dec 2026). Available now. Goes by Allan.</p>
        <div className="brief-actions">
          <a href="mailto:kamarajosephallan@gmail.com" className="brief-btn primary">Email Joseph</a>
          <a href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf" className="brief-btn">Résumé (PDF)</a>
          <a href="https://www.linkedin.com/in/joseph-allan-kamara" target="_blank" rel="noopener" className="brief-btn">LinkedIn</a>
          <Link href="/" className="brief-btn">Full portfolio</Link>
        </div>
      </header>

      {b.fit && (
        <section className="brief-card">
          <div className="brief-fit-top">
            <div>
              <h2>{b.fit.company ? `${b.fit.company} — ` : ''}{b.fit.role}</h2>
              <p>{b.fit.summary}</p>
            </div>
            <div className="brief-score"><b>{b.fit.score}</b><span>fit</span></div>
          </div>
          <table className="brief-table">
            <thead><tr><th>Requirement</th><th>Match</th><th>Evidence</th></tr></thead>
            <tbody>
              {b.fit.items.map((i, k) => (
                <tr key={k}>
                  <td>{i.requirement}</td>
                  <td><span className={`brief-pill ${STATUS[i.status].cls}`}>{STATUS[i.status].label}</span></td>
                  <td>{i.href ? <Link href={i.href}>{i.evidence}</Link> : i.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="brief-two">
            {!!b.fit.strengths.length && <div><h3>Strengths</h3><ul>{b.fit.strengths.map((s, k) => <li key={k}>{s}</li>)}</ul></div>}
            {!!b.fit.gaps.length && <div><h3>Honest gaps</h3><ul>{b.fit.gaps.map((s, k) => <li key={k}>{s}</li>)}</ul></div>}
          </div>
        </section>
      )}

      {!!b.qa.length && (
        <section className="brief-card">
          <h2>Questions asked</h2>
          {b.qa.map((x, k) => (
            <div key={k} className="brief-qa">
              <p className="q">{x.q}</p>
              <p className="a">{cite(x.a)}</p>
            </div>
          ))}
          <p className="brief-note">Answers were written by PWEZA, Joseph&apos;s portfolio assistant, from facts verified on his site.</p>
        </section>
      )}
    </main>
  )
}

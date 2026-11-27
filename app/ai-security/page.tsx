import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { attackStats } from '@/lib/pweza/guard'
import { lastEval, CASES } from '@/lib/pweza/eval'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'How PWEZA is secured · AI security',
  description: 'Live, anonymised record of prompt-injection and jailbreak attempts blocked by PWEZA, and the layered defences behind Joseph Allan Kamara’s portfolio assistant.',
}

const LABEL: Record<string, string> = {
  'prompt-injection': 'Prompt injection', 'prompt-extraction': 'System-prompt extraction', jailbreak: 'Jailbreak', impersonation: 'Owner impersonation', 'encoded-payload': 'Encoded payload', abuse: 'Code / injection payload',
}

const LAYERS = [
  ['Input firewall', 'Every message is screened for injection, extraction, jailbreak and impersonation patterns before any model sees it. Hits are refused and logged here.'],
  ['Grounded retrieval', 'PWEZA answers from passages of this site only. Each claim cites the passage it came from, so answers are checkable.'],
  ['Independent fact-checker', 'A second agent reviews every answer against the knowledge base and rewrites anything unsupported before it is final.'],
  ['Least-privilege tools', 'The assistant cannot browse, run code or reach private data. Its only actions are answering, linking pages and alerting Joseph.'],
  ['Rate limits & abuse controls', 'Per-visitor throttles on chat, alerts, briefings and résumé generation; attack alerts are de-duplicated.'],
  ['Honesty tests on every change', 'Automated tests run on every code change: visa, salary and work-authorization questions must go to Joseph, injections must be refused, and the facts may never overclaim. A failing test blocks the change.'],
  ['Daily honesty exam', 'Once a day the live assistant answers a set of trick questions (fake employers, fake projects, injected instructions, overclaiming bait) and is scored automatically. Results are below.'],
  ['Human in the loop', 'Joseph is alerted to attacks, hiring conversations and unanswered questions, and can take over any chat live.'],
]

export default async function AISecurityPage() {
  const [{ counts, recent }, exam] = await Promise.all([attackStats(), lastEval()])
  const total = Number(counts.total || 0)
  const cats = Object.entries(counts).filter(([k]) => k !== 'total').sort((a, b) => Number(b[1]) - Number(a[1]))
  return (
    <>
      <Nav />
      <main id="main" className="aisec">
        <p className="aisec-kicker">AI security · live</p>
        <h1>How PWEZA is secured</h1>
        <p className="aisec-lede">PWEZA is the AI assistant on this site. Like any public LLM app it gets probed. This page shows, live and anonymised, what it has blocked and how the defences are layered.</p>

        <section className="aisec-stats">
          <div className="big"><b>{total.toLocaleString()}</b><span>attacks blocked</span></div>
          {cats.map(([k, n]) => <div key={k}><b>{Number(n).toLocaleString()}</b><span>{LABEL[k] || k}</span></div>)}
          {!cats.length && <div><b>0</b><span>No attempts yet. Ask PWEZA to ignore its instructions and watch this number move.</span></div>}
        </section>

        <section className="aisec-card">
          <h2>Defence in depth</h2>
          <ol className="aisec-layers">
            {LAYERS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}
          </ol>
        </section>

        <section className="aisec-card">
          <h2>Daily honesty exam</h2>
          {exam ? (
            <>
              <p className="aisec-exam-score"><b>{exam.passed}/{exam.total}</b> trick questions passed · {new Date(exam.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              <ul className="aisec-exam">
                {exam.results.map((r) => (
                  <li key={r.id} className={r.pass ? 'ok' : 'bad'}>
                    <span className="tag">{r.pass ? '✓ Pass' : '✗ Fail'}</span>
                    <span className="area">{r.area}</span>
                    <span className="q">{r.q}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="aisec-muted">The first exam runs within a day. It asks the live assistant {CASES.length} trick questions and scores the answers automatically.</p>
          )}
          <p className="aisec-muted">Scored by rules, not by another AI: an answer fails if it invents an employer or project, claims an unearned certification, quotes unconfirmed figures, answers a visa or salary question itself, or follows an injected instruction.</p>
        </section>

        <section className="aisec-card">
          <h2>Recent blocked attempts</h2>
          {recent.length ? (
            <ul className="aisec-recent">
              {recent.map((r, i) => (
                <li key={i}>
                  <span className="tag">{LABEL[r.kind] || r.kind}</span>
                  <code>{r.sample}</code>
                  <time>{new Date(r.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
                </li>
              ))}
            </ul>
          ) : <p className="aisec-muted">Nothing blocked yet.</p>}
          <p className="aisec-muted">Samples are truncated and redacted (emails and long numbers removed). Visitors are identified only by a one-way hash.</p>
        </section>

        <p className="aisec-foot">Built by Joseph Allan Kamara. <Link href="/">See his work</Link> · <Link href="/privacy">Privacy</Link></p>
      </main>
      <Footer />
    </>
  )
}

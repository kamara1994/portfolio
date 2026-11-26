'use client'
import { useEffect, useState } from 'react'

// Telegram Mini App: opened from the bot (/dashboard or the menu button). Telegram passes signed
// launch data in the URL fragment; the API verifies it's Joseph before returning anything.

type Day = { day: string; visits: number; returning: number; priority: number; leads: number; chats: number; security: number; timeMs: number }
type Visit = { at: number; who: string; place: string; ref: string; score: number; dur: number; pages: string[]; actions: string[]; priority: boolean; live: boolean; brief?: string }
type Data = { ok: boolean; reason?: string; tz: string; days: Day[]; top: Record<'pages' | 'refs' | 'orgs' | 'countries', [string, number][]>; liveNow: number; visits: Visit[] }

const fmt = (ms: number) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` }
const sum = (d: Day[], k: keyof Omit<Day, 'day'>) => d.reduce((a, r) => a + (r[k] as number), 0)

function initData(): string {
  try {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    return hash.get('tgWebAppData') || sessionStorage.getItem('tg-init') || ''
  } catch { return '' }
}

export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const init = initData()
    if (!init) { setErr('Open this from your Telegram bot (/dashboard).'); return }
    try { sessionStorage.setItem('tg-init', init) } catch {}
    const load = () => fetch('/api/tg/dashboard', { headers: { 'x-tg-init': init }, cache: 'no-store' })
      .then((r) => r.json()).then((d: Data) => (d.ok ? setData(d) : setErr(d.reason === 'not-owner' ? 'This dashboard is private.' : d.reason === 'no-database' ? 'Database not connected yet.' : 'Session expired — reopen from Telegram.')))
      .catch(() => setErr('Could not load. Pull to refresh.'))
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [])

  if (err) return <main className="tgd"><p className="tgd-empty">{err}</p></main>
  if (!data) return <main className="tgd"><p className="tgd-empty">Loading…</p></main>

  const week = data.days.slice(-7), prev = data.days.slice(-14, -7), today = data.days[data.days.length - 1]
  const max = Math.max(1, ...data.days.map((d) => d.visits))
  const delta = (a: number, b: number) => (b ? `${a >= b ? '▲' : '▼'}${Math.abs(Math.round(((a - b) / b) * 100))}%` : '')

  return (
    <main className="tgd">
      <header className="tgd-head">
        <h1>Portfolio</h1>
        <span className={`tgd-live ${data.liveNow ? 'on' : ''}`}>{data.liveNow ? `● ${data.liveNow} browsing now` : 'No one browsing'}</span>
      </header>

      <section className="tgd-tiles">
        <div><b>{today.visits}</b><span>visitors today</span></div>
        <div><b>{sum(week, 'visits')}</b><span>this week <em>{delta(sum(week, 'visits'), sum(prev, 'visits'))}</em></span></div>
        <div><b>{sum(week, 'leads')}</b><span>strong leads</span></div>
        <div><b>{sum(week, 'priority')}</b><span>priority visits</span></div>
        <div><b>{sum(week, 'chats')}</b><span>PWEZA chats</span></div>
        <div><b>{fmt(sum(week, 'timeMs'))}</b><span>reading time</span></div>
      </section>

      <section className="tgd-card">
        <h2>Visitors · 30 days</h2>
        <svg viewBox="0 0 300 90" className="tgd-chart" aria-label="Visitors per day for 30 days">
          {data.days.map((d, i) => {
            const h = (d.visits / max) * 74
            return <rect key={d.day} x={i * 10 + 1} y={82 - h} width={8} height={Math.max(h, 1)} rx={2} className={i >= 23 ? 'wk' : ''}><title>{`${d.day}: ${d.visits}`}</title></rect>
          })}
        </svg>
        <div className="tgd-axis"><span>{data.days[0].day.slice(5)}</span><span>today</span></div>
      </section>

      <section className="tgd-grid">
        {([['Top pages', 'pages'], ['Sources', 'refs'], ['Organisations', 'orgs'], ['Countries', 'countries']] as const).map(([title, k]) => (
          <div key={k} className="tgd-card">
            <h2>{title} · 7d</h2>
            {data.top[k].length ? (
              <ol>{data.top[k].map(([n, c]) => <li key={n}><span>{n}</span><b>{c}</b></li>)}</ol>
            ) : <p className="tgd-muted">Nothing yet</p>}
          </div>
        ))}
      </section>

      <section className="tgd-card">
        <h2>Recent visitors</h2>
        <ul className="tgd-visits">
          {data.visits.map((v, i) => (
            <li key={i} className={v.priority ? 'pri' : ''}>
              <div className="row">
                <b>{v.live ? '● ' : ''}{v.who}</b>
                <span className="score">{v.score}</span>
              </div>
              <div className="meta">
                {new Date(v.at).toLocaleString('en-US', { timeZone: data.tz, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                {v.place ? ` · ${v.place}` : ''} · {v.ref} · {fmt(v.dur)}
              </div>
              <div className="pages">{v.pages.slice(0, 5).join(' → ')}</div>
              {!!v.actions.length && <div className="acts">{v.actions.join(' · ')}</div>}
              {v.brief && <div className="brief">{v.brief}</div>}
            </li>
          ))}
          {!data.visits.length && <li className="tgd-muted">No visits yet this week.</li>}
        </ul>
      </section>
    </main>
  )
}

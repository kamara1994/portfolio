'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Reports one visit as a single, live-updating Telegram alert.
// The browser only reports what happens on the page (path, time, scroll, clicks,
// chosen visitor type). Location and network are looked up on the server from the
// request itself (app/api/track/route.ts), so they can't be spoofed or blocked here.
//
// Stored in the browser: a random visitor ID + visit count (localStorage) so returning
// visits can be recognised, and the current visit's state (sessionStorage).

type Step = { p: string; d: number; s: number }
type Session = {
  sid: string; start: number; steps: Step[]; actions: string[]
  msgId?: number; ctx?: string; sig?: string; brief?: string
  leadSent?: boolean; lastBrief?: number; human?: boolean; role?: string | null
  sections?: Record<string, number>
}
type Visitor = { id: string; n: number; first: number; last?: number }

const SKEY = 'pa-visit'
const VKEY = 'pa-visitor'
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

function load<T>(store: Storage, key: string): T | null {
  try { const v = store.getItem(key); return v ? (JSON.parse(v) as T) : null } catch { return null }
}
function save(store: Storage, key: string, v: unknown) {
  try { store.setItem(key, JSON.stringify(v)) } catch { /* storage may be blocked */ }
}

const isLocal = () => {
  const h = window.location.hostname
  let forced = false
  try { forced = localStorage.getItem('pa-test') === '1' } catch {}
  return !forced && (h === 'localhost' || h.startsWith('127.') || h === '0.0.0.0')
}

function classifyLink(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute('href') || ''
  if (/\.pdf($|\?)/i.test(href) && /resume|résumé|cv/i.test(href)) return 'resume'
  if (href.startsWith('mailto:')) return 'email'
  if (/linkedin\.com/i.test(href)) return 'linkedin'
  if (/github\.com/i.test(href)) return 'github'
  if (/#source-code\b/.test(href)) return 'source'
  if (/#evidence\b/.test(href)) return 'evidence'
  if (/^https?:\/\//i.test(href) && !href.includes(window.location.host) && /demo/i.test(a.textContent || '')) return 'demo'
  return null
}

export default function VisitTracker() {
  const pathname = usePathname()
  const s = useRef<Session | null>(null)
  const v = useRef<Visitor | null>(null)
  const pageStart = useRef(Date.now())
  const pageScroll = useRef(0)
  const busy = useRef(false)
  const pending = useRef<ReturnType<typeof setTimeout>>()
  const enabled = useRef(false)

  // Visitor type picked on the homepage (?role=…); remembered for the rest of the visit.
  const role = () => {
    const r = new URLSearchParams(window.location.search).get('role')
    if (s.current && (r === 'recruiter' || r === 'soc' || r === 'engineer') && s.current.role !== r) { s.current.role = r; persist() }
    return s.current?.role || null
  }

  // Snapshot with the current page's time/scroll folded in.
  const snapshot = () => {
    const ses = s.current!
    const steps = ses.steps.map((x) => ({ ...x }))
    const cur = steps[steps.length - 1]
    if (cur) { cur.d = Date.now() - pageStart.current; cur.s = Math.max(cur.s, pageScroll.current) }
    return {
      sid: ses.sid, msgId: ses.msgId, ctx: ses.ctx, sig: ses.sig, brief: ses.brief, leadSent: ses.leadSent,
      steps, actions: ses.actions, durMs: Date.now() - ses.start, role: role(), human: !!ses.human,
      sections: ses.sections || {},
    }
  }

  const persist = () => { if (s.current) save(sessionStorage, SKEY, s.current) }

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/activity', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(payload),
    })
    return res.json().catch(() => ({}))
  }

  const start = async (attempt = 1): Promise<void> => {
    if (!s.current || s.current.msgId || busy.current) return
    busy.current = true
    try {
      const r = await post({
        type: 'start', ...snapshot(), page: pathname,
        referrer: document.referrer || 'direct',
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        visitor: { n: v.current?.n, last: v.current?.last, first: v.current?.first },
        webdriver: navigator.webdriver === true,
      })
      if (r?.msgId) { Object.assign(s.current, { msgId: r.msgId, ctx: r.ctx, sig: r.sig }); persist() }
      else if (r?.skipped) { enabled.current = false }
      else if (!r?.throttled && attempt < 3) setTimeout(() => start(attempt + 1), 1500 * attempt)
    } catch {
      if (attempt < 3) setTimeout(() => start(attempt + 1), 1500 * attempt)
    } finally { busy.current = false }
  }

  const update = async (type: 'update' | 'action' | 'end', extra: Record<string, unknown> = {}) => {
    if (!enabled.current || !s.current) return
    if (!s.current.msgId) { if (type !== 'end') start(); return }
    const ses = s.current
    const wantBrief = type === 'end' && Date.now() - (ses.lastBrief || 0) > 90_000 && Date.now() - ses.start > 15_000
    const payload = { type, ...snapshot(), wantBrief, ...extra }
    if (wantBrief) { ses.lastBrief = Date.now(); persist() }
    try {
      const r = await post(payload)
      if (r?.restart) { ses.msgId = undefined; ses.ctx = undefined; ses.sig = undefined; persist(); return }
      if (r?.brief) ses.brief = r.brief
      if (r?.lead) ses.leadSent = true
      persist()
    } catch { /* next update will carry the same state */ }
  }

  const schedule = (ms = 1500) => {
    clearTimeout(pending.current)
    pending.current = setTimeout(() => update('update'), ms)
  }

  // One-time setup: restore or begin the visit, wire listeners.
  useEffect(() => {
    if (isLocal() || window.location.pathname.startsWith('/tg/')) return
    enabled.current = true
    let ses = load<Session>(sessionStorage, SKEY)
    let vis = load<Visitor>(localStorage, VKEY)
    if (!ses) {
      const now = Date.now()
      vis = vis ? { ...vis, n: vis.n + 1 } : { id: rid(), n: 1, first: now }
      v.current = { ...vis } // includes the previous "last" for this alert
      save(localStorage, VKEY, { ...vis, last: now })
      ses = { sid: rid(), start: now, steps: [], actions: [] }
    } else {
      v.current = vis
    }
    s.current = ses

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const max = document.documentElement.scrollHeight - window.innerHeight
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 100
        if (pct > pageScroll.current) pageScroll.current = Math.min(100, pct)
      })
    }
    const human = () => { if (s.current && !s.current.human) { s.current.human = true; persist() } }
    const onClick = (e: MouseEvent) => {
      human()
      const a = (e.target as Element)?.closest?.('a') as HTMLAnchorElement | null
      if (!a) return
      const kind = classifyLink(a)
      if (!kind || !s.current) return
      s.current.actions.push(kind); persist()
      update('action', { action: kind, page: window.location.pathname })
    }
    const onPlay = (e: Event) => {
      if (!(e.target instanceof HTMLVideoElement) || !s.current) return
      if (!s.current.actions.includes('video')) { s.current.actions.push('video'); persist(); schedule() }
    }
    const onPweza = () => {
      if (s.current && !s.current.actions.includes('pweza')) { s.current.actions.push('pweza'); persist(); schedule() }
    }
    const onHide = () => { if (document.visibilityState === 'hidden') update('end') }
    const onRole = () => schedule(800)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointerdown', human, { passive: true, once: true })
    window.addEventListener('wheel', human, { passive: true, once: true })
    window.addEventListener('touchstart', human, { passive: true, once: true })
    window.addEventListener('keydown', human, { once: true })
    document.addEventListener('click', onClick, true)
    document.addEventListener('play', onPlay, true)
    window.addEventListener('pweza-asked', onPweza)
    window.addEventListener('rolechange', onRole)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)

    // Which section is on screen each second (homepage: Projects, Skills, Contact…; project pages: Architecture, Evidence…).
    const sectionTick = setInterval(() => {
      if (document.visibilityState !== 'visible' || !s.current) return
      const vh = window.innerHeight
      let best = '', bestPx = vh * 0.3
      document.querySelectorAll<HTMLElement>('main section[id], #contact').forEach((el) => {
        const r = el.getBoundingClientRect()
        const px = Math.min(r.bottom, vh) - Math.max(r.top, 0)
        if (px > bestPx) { bestPx = px; best = el.id }
      })
      if (!best) return
      const sec = (s.current.sections ||= {})
      sec[best] = (sec[best] || 0) + 1000
    }, 1000)
    const sectionSave = setInterval(persist, 5000)

    // Keep the live alert's time fresh while the tab is open (max ~15 min).
    let beats = 0
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible' && beats++ < 15) update('update')
    }, 60_000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', human)
      window.removeEventListener('wheel', human)
      window.removeEventListener('touchstart', human)
      window.removeEventListener('keydown', human)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('play', onPlay, true)
      window.removeEventListener('pweza-asked', onPweza)
      window.removeEventListener('rolechange', onRole)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      clearInterval(heartbeat)
      clearInterval(sectionTick)
      clearInterval(sectionSave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Each page change: close the previous step, open a new one, report.
  useEffect(() => {
    if (!enabled.current || !s.current) return
    const ses = s.current
    const last = ses.steps[ses.steps.length - 1]
    if (last && last.p === pathname && Date.now() - ses.start > 1000) return // restored session, same page
    if (last) { last.d = Date.now() - pageStart.current; last.s = Math.max(last.s, pageScroll.current) }
    pageStart.current = Date.now()
    pageScroll.current = 0
    ses.steps.push({ p: pathname, d: 0, s: 0 })
    if (ses.steps.length > 60) ses.steps.splice(0, ses.steps.length - 60)
    persist()
    if (ses.msgId) schedule(); else setTimeout(() => start(), 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}

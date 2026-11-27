'use client'

import { useEffect, useRef, useState } from 'react'
import PwezaMark from './PwezaMark'
import { RESUME } from './Nav'

const ITEMS = [
  { label: 'Work', href: '/#work', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></> },
  { label: 'Skills', href: '/#skills', icon: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" /> },
  null,
  { label: 'Résumé', href: RESUME, ext: true, icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></> },
  { label: 'Contact', href: '/#contact', icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></> },
] as const

const H = 64 // bar height
const BH = 30 // how far the glass rises around the Ask button
const R = 22 // corner radius

/** Glass outline: a rounded bar whose top edge swells smoothly around the centered Ask button. */
function shape(w: number) {
  const cx = w / 2, bw = 132, y = BH, b = H + BH
  const l = cx - bw / 2, r = cx + bw / 2
  return [
    `M ${R} ${y}`, `L ${l} ${y}`,
    `C ${l + 30} ${y} ${cx - 38} ${y - BH} ${cx} ${y - BH}`,
    `C ${cx + 38} ${y - BH} ${r - 30} ${y} ${r} ${y}`,
    `L ${w - R} ${y}`, `A ${R} ${R} 0 0 1 ${w} ${y + R}`,
    `L ${w} ${b - R}`, `A ${R} ${R} 0 0 1 ${w - R} ${b}`,
    `L ${R} ${b}`, `A ${R} ${R} 0 0 1 0 ${b - R}`,
    `L 0 ${y + R}`, `A ${R} ${R} 0 0 1 ${R} ${y}`, 'Z',
  ].join(' ')
}

/** App-style bottom dock for phones: four shortcuts and a raised AI button. */
export default function MobileDock() {
  const [active, setActive] = useState('')
  const [shown, setShown] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = nav.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const ids = ['work', 'skills', 'contact']
    const onScroll = () => {
      setShown(window.scrollY > 200)
      let cur = ''
      const mid = window.innerHeight * 0.5
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect()
        if (r && r.top < mid && r.bottom > mid) cur = id
      }
      // The footer is short: count it once it is on screen
      const f = document.getElementById('contact')?.getBoundingClientRect()
      if (f && f.top < window.innerHeight * 0.8) cur = 'contact'

      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav ref={nav} aria-label="Quick links" className={`dock lg:hidden ${shown ? 'is-on' : ''}`}>
      {w > 0 && (
        <span className="dock-shape" aria-hidden="true" style={{ top: -BH, height: H + BH }}>
          <svg className="dock-shadow" width={w} height={H + BH} viewBox={`0 0 ${w} ${H + BH}`}><path d={shape(w)} /></svg>
          <span className="dock-glass" style={{ clipPath: `path('${shape(w)}')` }} />
          <svg className="dock-line" width={w} height={H + BH} viewBox={`0 0 ${w} ${H + BH}`}>
            <defs>
              <linearGradient id="dock-glow" x1="0" x2={w} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6FD6FF" stopOpacity=".18" />
                <stop offset=".34" stopColor="#6FD6FF" stopOpacity=".45" />
                <stop offset=".5" stopColor="#7FF0E0" stopOpacity="1" />
                <stop offset=".66" stopColor="#6FD6FF" stopOpacity=".45" />
                <stop offset="1" stopColor="#6FD6FF" stopOpacity=".18" />
              </linearGradient>
            </defs>
            <path className="dock-line-glow" d={shape(w)} />
            <path className="dock-line-core" d={shape(w)} />
          </svg>
        </span>
      )}
      {ITEMS.map((it) =>
        it === null ? (
          <button
            key="ai"
            type="button"
            className="dock-ai relative"
            aria-label="Ask my AI assistant"
            onClick={() => window.dispatchEvent(new Event('pweza:toggle'))}
          >
            <PwezaMark size={40} />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-[17px] left-1/2 -translate-x-1/2 text-[11px] font-semibold leading-none tracking-wide text-snow">Ask</span>
          </button>
        ) : (
          <a
            key={it.label}
            href={it.href}
            {...('ext' in it ? { target: '_blank', rel: 'noopener' } : {})}
            className={`dock-item ${active && it.href === `/#${active}` ? 'is-active' : ''}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {it.icon}
            </svg>
            <span>{it.label}</span>
          </a>
        ),
      )}
    </nav>
  )
}

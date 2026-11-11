'use client'

import { useEffect, useRef } from 'react'
import { CITY, MAP_H, MAP_W } from '@/lib/world-cities'

type Kind = 'allow' | 'inspect' | 'block' | 'cloud'
const COLOR: Record<Kind, string> = { allow: '#4CC9FF', inspect: '#FFB547', block: '#FF5D5D', cloud: '#A78BFA' }
const HUBS = ['philly', 'seattle', 'rexburg']

// [from, to, kind, duration seconds]
const FLOWS: [string, string, Kind, number][] = [
  ['singapore', 'philly', 'block', 4.2],
  ['freetown', 'philly', 'allow', 3.4],
  ['frankfurt', 'philly', 'inspect', 3.6],
  ['philly', 'seattle', 'cloud', 2.8],
  ['tokyo', 'seattle', 'block', 3.9],
  ['london', 'philly', 'allow', 3.2],
  ['saopaulo', 'philly', 'inspect', 3.5],
  ['mumbai', 'philly', 'block', 4.4],
  ['lagos', 'london', 'allow', 2.9],
  ['dubai', 'frankfurt', 'inspect', 3.1],
  ['capetown', 'lagos', 'allow', 3.0],
  ['philly', 'rexburg', 'allow', 3.3],
  ['sydney', 'singapore', 'block', 3.7],
]

// Each city glows in the color of the traffic it sends; hubs glow teal.
const HEAT: Record<string, string> = Object.fromEntries(
  Object.keys(CITY).map((c) => [c, HUBS.includes(c) ? '#4BE3C8' : COLOR[(FLOWS.find((f) => f[0] === c) ?? FLOWS.find((f) => f[1] === c))![2]]]),
)

function arc(a: [number, number], b: [number, number]) {
  const [x1, y1] = a, [x2, y2] = b
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - dist * 0.3
  return `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`
}

/** Footer backdrop: glowing world outline with simulated SOC traffic arcing between cities. */
export default function SocMap() {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  // Run only while the footer is on screen
  useEffect(() => {
    const el = root.current, s = svg.current
    if (!el || !s) return
    s.pauseAnimations()
    const io = new IntersectionObserver(([e]) => {
      el.classList.toggle('is-live', e.isIntersecting)
      if (e.isIntersecting) s.unpauseAnimations(); else s.pauseAnimations()
    }, { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={root} aria-hidden className="socmap">
      <svg ref={svg} viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice" className="socmap-svg">
        <defs>
          {Array.from(new Set(Object.values(HEAT))).map((c) => (
            <radialGradient key={c} id={`sm-heat-${c.slice(1)}`}>
              <stop stopColor={c} stopOpacity=".75" />
              <stop offset=".35" stopColor={c} stopOpacity=".28" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="sm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <image href="/map/world.svg" x="0" y="0" width={MAP_W} height={MAP_H} />

        {/* Heat halos */}
        {Object.entries(CITY).map(([k, [x, y]]) => (
          <circle key={`h-${k}`} cx={x} cy={y} r={HUBS.includes(k) ? 46 : 34} fill={`url(#sm-heat-${HEAT[k].slice(1)})`}
            className="sm-heat" style={{ animationDelay: `${(x % 9) * 0.35}s` }} />
        ))}

        {/* Traffic */}
        <g filter="url(#sm-glow)">
          {FLOWS.map(([from, to, kind, dur], i) => {
            const d = arc(CITY[from], CITY[to])
            const begin = `${(i * 0.9) % 6}s`
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={COLOR[kind]} strokeOpacity=".22" strokeWidth="1.2" />
                <path d={d} pathLength={1} fill="none" stroke={COLOR[kind]} strokeWidth="3" strokeLinecap="round"
                  className="sm-trail" style={{ animationDuration: `${dur}s`, animationDelay: begin }} />
                <circle r="4.2" fill="#FFF6E8" className="sm-head">
                  <animateMotion dur={`${dur}s`} begin={begin} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .25 1" />
                </circle>
              </g>
            )
          })}
        </g>

        {/* City cores */}
        {Object.entries(CITY).map(([k, [x, y]]) => (
          <g key={k}>
            <circle cx={x} cy={y} r={HUBS.includes(k) ? 4.5 : 3.2} fill="#FFFFFF" />
            <circle cx={x} cy={y} r="4" fill="none" stroke={HEAT[k]} strokeWidth="1.4" className="sm-ping"
              style={{ animationDelay: `${(x % 7) * 0.4}s` }} />
          </g>
        ))}
      </svg>
    </div>
  )
}

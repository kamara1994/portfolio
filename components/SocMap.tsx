'use client'

import { useEffect, useRef } from 'react'
import { CITY, WORLD_DOTS } from '@/lib/world-dots'

type Kind = 'allow' | 'inspect' | 'block' | 'cloud'
const COLOR: Record<Kind, string> = { allow: '#4CC9FF', inspect: '#FFB547', block: '#FF5D73', cloud: '#A78BFA' }
// [from, to, kind, event, duration seconds]
const FLOWS: [string, string, Kind, string, number][] = [
  ['singapore', 'philly', 'block', 'SSH brute-force burst', 4.2],
  ['freetown', 'philly', 'allow', 'VPN session, MFA passed', 3.4],
  ['frankfurt', 'philly', 'inspect', 'Suspicious login, new device', 3.6],
  ['philly', 'seattle', 'cloud', 'CloudWatch logs shipped', 2.8],
  ['tokyo', 'seattle', 'block', 'Port scan on public subnet', 3.9],
  ['london', 'philly', 'allow', 'HTTPS API traffic', 3.2],
  ['saopaulo', 'philly', 'inspect', 'Phishing link clicked, held', 3.5],
  ['mumbai', 'philly', 'block', 'Credential stuffing attempt', 4.4],
  ['lagos', 'london', 'allow', 'Mail relay, SPF pass', 2.9],
  ['dubai', 'frankfurt', 'inspect', 'Unusual DNS volume', 3.1],
  ['capetown', 'lagos', 'allow', 'Branch office sync', 3.0],
  ['philly', 'rexburg', 'allow', 'Lab VPN tunnel up', 3.3],
  ['sydney', 'singapore', 'block', 'Malicious IP on blocklist', 3.7],
]

function arc(a: [number, number], b: [number, number]) {
  const [x1, y1] = a, [x2, y2] = b
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - dist * 0.28
  return `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`
}

/** Footer backdrop: dotted world map with simulated SOC traffic moving between cities. */
export default function SocMap() {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  // Pause everything while the footer is off screen
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
      <svg ref={svg} aria-hidden viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" className="socmap-svg">
        <defs>
          <radialGradient id="sm-hub">
            <stop stopColor="#4CC9FF" stopOpacity=".35" />
            <stop offset="1" stopColor="#4CC9FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={WORLD_DOTS} stroke="#5D7FB8" strokeOpacity=".38" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx={CITY.philly[0]} cy={CITY.philly[1]} r="55" fill="url(#sm-hub)" />

        {FLOWS.map(([from, to, kind], i) => {
          const d = arc(CITY[from], CITY[to])
          const dur = FLOWS[i][4]
          const begin = `${(i * 0.9) % 6}s`
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={COLOR[kind]} strokeOpacity=".14" strokeWidth="1" />
              <path d={d} pathLength={1} fill="none" stroke={COLOR[kind]} strokeWidth="2" strokeLinecap="round"
                className="sm-trail" style={{ animationDuration: `${dur}s`, animationDelay: begin }} />
              <circle r="3.4" fill={COLOR[kind]} className="sm-head">
                <animateMotion dur={`${dur}s`} begin={begin} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .25 1" />
              </circle>
            </g>
          )
        })}

        {Object.entries(CITY).map(([k, [x, y]]) => (
          <g key={k}>
            <circle cx={x} cy={y} r={k === 'philly' ? 4.5 : 3} fill={k === 'philly' ? '#4BE3C8' : '#CFE3FF'} />
            <circle cx={x} cy={y} r="4" fill="none" stroke={k === 'philly' ? '#4BE3C8' : '#8FB8FF'} className="sm-ping"
              style={{ animationDelay: `${(x % 7) * 0.4}s` }} />
          </g>
        ))}
      </svg>

    </div>
  )
}

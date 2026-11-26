'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const FLIP_EVERY_MS = 4000

// [left %, top %, size px, twinkle delay s, twinkle duration s]
const STARS: [number, number, number, number, number][] = [
  [4, 18, 1.4, 0, 3.2], [11, 62, 1, 1.4, 4.1], [19, 30, 1.8, 2.2, 3.6], [27, 12, 1, 0.6, 4.6],
  [34, 70, 1.2, 3.1, 3.9], [42, 22, 1.6, 1.1, 5.2], [49, 48, 1, 2.7, 3.4], [56, 14, 1.3, 0.3, 4.4],
  [63, 64, 1.7, 1.9, 3.7], [70, 26, 1, 3.5, 4.9], [77, 10, 1.5, 0.9, 3.3], [84, 56, 1.1, 2.4, 4.2],
  [90, 20, 1.9, 1.6, 3.8], [96, 66, 1, 0.5, 4.7], [15, 84, 1, 2.9, 5.0], [67, 86, 1.2, 1.2, 4.0],
]

/** A living night sky: twinkling stars, a slowly gliding moon, and layered drifting clouds. */
function NightSky() {
  return (
    <span aria-hidden className="sky">
      <span className="sky-glow" />
      <span className="sky-stars">
        {STARS.map(([l, t, s, d, dur], i) => (
          <i key={i} style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
        ))}
      </span>

      <svg className="sky-clouds sky-clouds-back" viewBox="0 0 600 60" preserveAspectRatio="none">
        <defs>
          <filter id="fs-cloud-back" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.075" numOctaves="5" seed="7" />
            <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.50  0 0 0 0 0.70  2.4 0 0 0 -1.05" />
          </filter>
          <linearGradient id="fs-fade-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="fs-mask-back"><rect width="600" height="60" fill="url(#fs-fade-back)" /></mask>
        </defs>
        <rect width="600" height="60" filter="url(#fs-cloud-back)" mask="url(#fs-mask-back)" />
      </svg>

      <span className="sky-moon-track">
        <span className="sky-moon" />
      </span>

      <svg className="sky-clouds sky-clouds-front" viewBox="0 0 600 60" preserveAspectRatio="none">
        <defs>
          <filter id="fs-cloud-front" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.06" numOctaves="5" seed="21" />
            <feColorMatrix values="0 0 0 0 0.86  0 0 0 0 0.90  0 0 0 0 0.98  2.6 0 0 0 -1.32" />
          </filter>
          <linearGradient id="fs-fade-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="fs-mask-front"><rect width="600" height="60" fill="url(#fs-fade-front)" /></mask>
        </defs>
        <rect width="600" height="60" filter="url(#fs-cloud-front)" mask="url(#fs-mask-front)" />
      </svg>

      <span className="sky-sheen" />
    </span>
  )
}

/** Top-left pill: a night sky with OPEN TO WORK / HIRE ME flipping every 4s; pauses on hover/focus; links to Contact. */
export default function FlipStatus() {
  const [flipped, setFlipped] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setFlipped((f) => !f), FLIP_EVERY_MS)
    return () => window.clearInterval(t)
  }, [paused])

  return (
    <Link
      href="/#contact"
      className="status-pill"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <NightSky />
      <span className="flip">
        <span className={`flip-inner ${flipped ? 'is-flipped' : ''}`}>
          <span className="flip-face">Open to work</span>
          <span className="flip-face flip-back">Hire me</span>
        </span>
      </span>
      <span className="sr-only">, contact Joseph</span>
    </Link>
  )
}

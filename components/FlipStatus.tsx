'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const FLIP_EVERY_MS = 4000

/** Top-left pill: flips between OPEN TO WORK and HIRE ME every 4s; pauses on hover/focus; links to Contact. */
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
      aria-label="Open to work. Hire me: contact Joseph"
      className="status-pill"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span aria-hidden className="status-dot" />
      <span aria-hidden className="flip">
        <span className={`flip-inner ${flipped ? 'is-flipped' : ''}`}>
          <span className="flip-face">Open to work</span>
          <span className="flip-face flip-back">Hire me</span>
        </span>
      </span>
    </Link>
  )
}

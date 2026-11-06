'use client'
import { useEffect } from 'react'

/**
 * Liquid buttons. Renders the SVG water filters once, and makes every .btn
 * behave like a surface of water: a tap sends ripples out from the touch
 * point and briefly stirs the water inside the button.
 */
export default function Water() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const splashMap = document.getElementById('splash-map') as SVGFEDisplacementMapElement | null
    let raf = 0

    const stir = () => {
      if (!splashMap || reduce) return
      cancelAnimationFrame(raf)
      const start = performance.now()
      const step = (t: number) => {
        const k = Math.min((t - start) / 900, 1)
        // a damped wobble: big slosh that settles back to calm
        const s = 14 * Math.exp(-4 * k) * Math.abs(Math.cos(k * 9))
        splashMap.setAttribute('scale', s.toFixed(2))
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn-primary, .btn-ghost')
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const size = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2

      for (let i = 0; i < 2; i++) {
        const ring = document.createElement('span')
        ring.className = 'water-ring'
        ring.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;animation-delay:${i * 140}ms`
        btn.appendChild(ring)
        ring.addEventListener('animationend', () => ring.remove(), { once: true })
      }

      btn.classList.add('is-splash')
      window.setTimeout(() => btn.classList.remove('is-splash'), 900)
      stir()
    }

    document.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onDown)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Calm water: slow, small surface movement */}
        <filter id="water" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.045" numOctaves="2" seed="3" result="noise">
            <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite"
              values="0.014 0.045;0.02 0.06;0.014 0.045" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Stirred water: same surface, scale driven from JS on tap */}
        <filter id="splash" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap id="splash-map" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

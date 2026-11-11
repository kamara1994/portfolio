'use client'

import { useEffect, useRef } from 'react'

/**
 * A small soft light that follows the mouse and gently brightens whatever is
 * under it. Mouse/trackpad only (never on touch), and off for reduced motion.
 */
export default function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let x = -500, y = -500, cx = x, cy = y, raf = 0
    const loop = () => {
      cx += (x - cx) * 0.22
      cy += (y - cy) * 0.22
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX; y = e.clientY
      el.classList.add('is-on')
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => el.classList.remove('is-on')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={ref} aria-hidden className="cursor-light" />
}

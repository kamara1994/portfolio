'use client'

import { useEffect, useRef } from 'react'

/** Fades in the matching rows of its parent section as each one scrolls into view (once). */
export default function RevealRows({ selector }: { selector: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = ref.current?.parentElement
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rows = Array.from(host.querySelectorAll<HTMLElement>(selector))
    rows.forEach((r) => r.classList.add('row-hide'))
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const el = e.target
        el.classList.add('row-in')
        io.unobserve(el)
        // Hand control back to the normal styles (hover dimming) once it has appeared
        window.setTimeout(() => el.classList.remove('row-hide', 'row-in'), 800)
      })
    }, { rootMargin: '0px 0px -12% 0px' })
    rows.forEach((r) => io.observe(r))
    return () => io.disconnect()
  }, [selector])

  return <span ref={ref} hidden />
}

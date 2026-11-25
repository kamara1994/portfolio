'use client'

import { useEffect, useRef, useState } from 'react'

export default function NextProjectTitle({ title }: { title: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <p ref={ref} className={`next-project-title mt-3 font-display text-[clamp(40px,6vw,88px)] font-bold uppercase leading-none${visible ? ' is-visible' : ''}`}>
      {title}
    </p>
  )
}

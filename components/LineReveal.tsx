'use client'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Splits text into words, measures which visual line each word lands on, and gives
 * every word that line's index. CSS then reveals the text one line at a time.
 * Re-measures on resize, so the lines stay true at any screen width.
 */
export default function LineReveal({ parts, as: Tag = 'p', className = '', startLine = 0 }: {
  parts: { text: string; className?: string; attach?: boolean }[]
  as?: 'p' | 'h2' | 'span'
  className?: string
  startLine?: number
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const words = Array.from(el.querySelectorAll<HTMLElement>('.lr-w'))
      let line = -1
      let lastTop = -Infinity
      for (const w of words) {
        const top = w.offsetTop
        if (top > lastTop + 2) { line += 1; lastTop = top }
        w.style.setProperty('--ln', String(startLine + line))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [startLine])

  const words: ReactNode[] = []
  parts.forEach((p, pi) => {
    if (p.attach && words[words.length - 1] === ' ') words.pop() // glue to the previous word (e.g. a period)
    p.text.split(/\s+/).filter(Boolean).forEach((w, wi) => {
      words.push(
        <span key={`${pi}-${wi}`} className={`lr-w ${p.className ?? ''}`}>{w}</span>,
        ' ',
      )
    })
  })

  const Comp = Tag as 'p'
  return (
    <Comp ref={ref as React.RefObject<HTMLParagraphElement>} className={`lr ${className}`}>
      {words}
    </Comp>
  )
}

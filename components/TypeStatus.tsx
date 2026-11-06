'use client'
import { useEffect, useState } from 'react'

const TEXT = 'OPEN TO WORK'

/** Types "OPEN TO WORK" once on load, blinks the caret a few times, then rests. */
export default function TypeStatus() {
  const [shown, setShown] = useState(0)
  const [caret, setCaret] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(TEXT.length)
      setCaret(false)
      return
    }
    let i = 0
    let typer: number | undefined
    const start = window.setTimeout(() => {
      typer = window.setInterval(() => {
        i += 1
        setShown(i)
        if (i >= TEXT.length) {
          window.clearInterval(typer)
          window.setTimeout(() => setCaret(false), 2400) // ~3 blinks, then rest
        }
      }, 95)
    }, 500)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(typer)
    }
  }, [])

  return (
    <span className="inline-flex items-center font-display text-[17px] font-semibold tracking-[0.18em] text-snow">
      <span aria-hidden>{TEXT.slice(0, shown)}</span>
      <span aria-hidden className={`ml-[3px] h-[1.05em] w-[2px] bg-signal ${caret ? 'animate-caret' : 'opacity-0'}`} />
      <span className="sr-only">{TEXT}</span>
    </span>
  )
}

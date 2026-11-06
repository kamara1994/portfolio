'use client'
import { useEffect, useState } from 'react'

const TEXT = 'OPEN TO WORK'
const TYPE_MS = 95
const DELETE_MS = 45
const HOLD_MS = 2600
const GAP_MS = 600

/** Types "OPEN TO WORK", holds, deletes, and repeats for as long as the page is open. */
export default function TypeStatus() {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(TEXT.length)
      return
    }
    let n = 0
    let deleting = false
    let timer: number

    const tick = () => {
      if (!deleting) {
        n += 1
        setShown(n)
        if (n === TEXT.length) {
          deleting = true
          timer = window.setTimeout(tick, HOLD_MS)
          return
        }
        timer = window.setTimeout(tick, TYPE_MS)
      } else {
        n -= 1
        setShown(n)
        if (n === 0) {
          deleting = false
          timer = window.setTimeout(tick, GAP_MS)
          return
        }
        timer = window.setTimeout(tick, DELETE_MS)
      }
    }
    timer = window.setTimeout(tick, 500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <span className="inline-flex items-center font-display text-[17px] font-semibold tracking-[0.18em] text-snow">
      <span aria-hidden>{TEXT.slice(0, shown)}</span>
      <span aria-hidden className="ml-[3px] h-[1.05em] w-[2px] bg-signal animate-caret" />
      <span className="sr-only">{TEXT}</span>
    </span>
  )
}

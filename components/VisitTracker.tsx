'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Thin client: just reports page + referrer + device hints. All geolocation,
// company matching, and enrichment happen server-side from the real request IP
// (see app/api/track/route.ts) — so ad-blockers can't defeat it and the client
// can't spoof the location.
export default function VisitTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const host = window.location.hostname
    if (host === 'localhost' || host.startsWith('127.') || host === '0.0.0.0') return

    // avoid duplicate fires for the same path within a session render cycle
    if (lastSent.current === pathname) return
    lastSent.current = pathname

    const track = () => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || 'direct',
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
        }),
      }).catch(() => {})
    }

    const timer = setTimeout(track, 900)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

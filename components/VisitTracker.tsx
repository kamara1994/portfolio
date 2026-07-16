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

    let sent = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const track = async () => {
      if (sent) return
      sent = true
      try {
        const response = await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer || 'direct',
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
          }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result?.telegram?.ok === false) throw new Error('visit-alert-failed')
      } catch {
        sent = false
        retryTimer = setTimeout(track, 1500)
      }
    }

    const sendBeforeLeave = () => {
      if (document.visibilityState === 'hidden') track()
    }

    const timer = setTimeout(track, 200)
    document.addEventListener('visibilitychange', sendBeforeLeave)
    return () => {
      clearTimeout(timer)
      if (retryTimer) clearTimeout(retryTimer)
      document.removeEventListener('visibilitychange', sendBeforeLeave)
    }
  }, [pathname])

  return null
}

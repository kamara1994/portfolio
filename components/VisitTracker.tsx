'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const TARGET_COMPANIES = [
  'boozallen', 'booz-allen', 'bah.com',
  'anthropic', 'openai', 'google', 'deepmind',
  'microsoft', 'amazon', 'aws',
  'crowdstrike', 'mandiant', 'palo alto', 'paloaltonetworks',
  'wiz.io', 'lakera', 'snyk', 'lacework',
  'deloitte', 'ey.com', 'pwc', 'kpmg', 'accenture',
  'jobyaviation', 'gtlic', 'gi-de', 'situsamc',
  'honeywell', 'lockheedmartin', 'rtx', 'northrop',
  'hackerone', 'bugcrowd',
]

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hostname === 'localhost') return
    if (window.location.hostname.startsWith('127.')) return

    const trackVisit = async () => {
      try {
        const referrer = document.referrer || 'direct'
        const screenSize = `${window.screen.width}x${window.screen.height}`
        const language = navigator.language
        const timestamp = new Date().toISOString()

        const referrerLower = referrer.toLowerCase()
        let matchedCompany = TARGET_COMPANIES.find(c => referrerLower.includes(c)) || ''

        let location = 'Unknown'
        let companyHint = ''
        try {
          const geoRes = await fetch('https://ipapi.co/json/')
          const geo = await geoRes.json()
          location = `${geo.city || '?'}, ${geo.region || '?'}, ${geo.country_name || '?'}`
          companyHint = geo.org || ''
          if (!matchedCompany) {
            const orgLower = companyHint.toLowerCase()
            matchedCompany = TARGET_COMPANIES.find(c => orgLower.includes(c)) || ''
          }
        } catch {}

        const isPriority = !!matchedCompany

        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: isPriority ? '🔥 PRIORITY VISIT' : '👀 Portfolio visit',
            description: [
              `📄 Page: ${pathname}`,
              `📍 Location: ${location}`,
              companyHint ? `🏢 ISP/Org: ${companyHint}` : null,
              matchedCompany ? `🎯 Match: ${matchedCompany}` : null,
              `🔗 Referrer: ${referrer}`,
              `📱 Device: ${screenSize} | ${language}`,
              `🕐 Time: ${timestamp}`,
            ].filter(Boolean).join('\n'),
            icon: isPriority ? '🔥' : '👀',
            notify: true,
            tags: {
              page: pathname,
              priority: isPriority ? 'high' : 'normal',
              ...(matchedCompany ? { company: matchedCompany } : {}),
            },
          }),
        })
      } catch {}
    }

    const timer = setTimeout(trackVisit, 1000)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
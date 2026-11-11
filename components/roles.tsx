'use client'
import { useEffect, useState, type ReactNode } from 'react'

export type Role = 'recruiter' | 'soc' | 'engineer'

export const ROLES: { id: Role; label: string; blurb: string; order: string[]; icon: ReactNode }[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    blurb: 'Best projects first, plus résumé',
    order: ['blue-soc-p8', 'fortress-v2', 'blue-x', 'pweza-voice-agent'],
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5h6v2M3 13h18" />
      </>
    ),
  },
  {
    id: 'soc',
    label: 'SOC Analyst',
    blurb: 'Detection, triage, and response',
    order: ['blue-soc-p8', 'blue-x', 'fortress-v2', 'pweza-voice-agent'],
    icon: <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  },
  {
    id: 'engineer',
    label: 'Security Engineer',
    blurb: 'Cloud, automation, and ML',
    order: ['fortress-v2', 'blue-x', 'blue-soc-p8', 'pweza-voice-agent'],
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
      </>
    ),
  },
]

const EVENT = 'rolechange'
const isRole = (v: string | null): v is Role => !!v && ROLES.some((r) => r.id === v)

/** Current reader role, from ?role= in the URL. Updates when chooseRole() runs. */
export function useRole(): Role | null {
  const [role, setRole] = useState<Role | null>(null)
  useEffect(() => {
    const read = () => {
      const r = new URLSearchParams(window.location.search).get('role')
      setRole(isRole(r) ? r : null)
    }
    read()
    window.addEventListener(EVENT, read)
    window.addEventListener('popstate', read)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener('popstate', read)
    }
  }, [])
  return role
}

/** Set (or clear) the role, keep it in the URL so the link is shareable, and scroll to the work. */
export function chooseRole(role: Role | null) {
  const url = new URL(window.location.href)
  if (role) url.searchParams.set('role', role)
  else url.searchParams.delete('role')
  url.hash = 'work'
  window.history.pushState(null, '', url.pathname + url.search + url.hash)
  window.dispatchEvent(new Event(EVENT))
  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function RoleIcon({ role, className = 'h-5 w-5' }: { role: Role; className?: string }) {
  const r = ROLES.find((x) => x.id === role)!
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`icon-live ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {r.icon}
    </svg>
  )
}

'use client'
import { useEffect, useState } from 'react'

export type Role = 'recruiter' | 'soc' | 'engineer'

export const ROLES: { id: Role; label: string; blurb: string; order: string[]; icon: string }[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    blurb: 'Best projects first, plus résumé',
    order: ['blue-soc-p8', 'fortress-v2', 'blue-x', 'pweza-voice-agent'],
    icon: '💼',
  },
  {
    id: 'soc',
    label: 'SOC Analyst',
    blurb: 'Detection, triage, and response',
    order: ['blue-soc-p8', 'blue-x', 'fortress-v2', 'pweza-voice-agent'],
    icon: '🛡️',
  },
  {
    id: 'engineer',
    label: 'Security Engineer',
    blurb: 'Cloud, automation, and ML',
    order: ['fortress-v2', 'blue-x', 'blue-soc-p8', 'pweza-voice-agent'],
    icon: '⚙️',
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

export function RoleIcon({ role, className = '' }: { role: Role; className?: string }) {
  const r = ROLES.find((x) => x.id === role)!
  return <span aria-hidden className={`emoji ${className}`}>{r.icon}</span>
}

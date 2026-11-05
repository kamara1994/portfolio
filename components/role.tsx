'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Role = 'recruiter' | 'analyst' | 'engineer'

export const ROLES: Record<
  Role,
  { label: string; short: string; intro: string; order: string[] }
> = {
  recruiter: {
    label: 'Recruiter',
    short: 'Recruiter',
    intro: 'Cybersecurity engineer. I build SOC automation, cloud security labs on AWS, and AI tools that catch threats faster.',
    order: ['blue-soc-p8', 'fortress-v2', 'blue-x', 'pweza-voice-agent'],
  },
  analyst: {
    label: 'SOC Analyst',
    short: 'SOC',
    intro: 'I work like a SOC analyst and automate like an engineer: Splunk, alert triage, incident response, and MITRE ATT&CK.',
    order: ['blue-soc-p8', 'blue-x', 'fortress-v2', 'pweza-voice-agent'],
  },
  engineer: {
    label: 'Security Engineer',
    short: 'Engineer',
    intro: 'I build security systems as code: AWS and Terraform, PyTorch threat models, Python automation, and APIs.',
    order: ['fortress-v2', 'blue-x', 'blue-soc-p8', 'pweza-voice-agent'],
  },
}

const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({ role: 'recruiter', setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('recruiter')

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('role')
    if (r && r in ROLES) setRoleState(r as Role)
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    const url = new URL(window.location.href)
    if (r === 'recruiter') url.searchParams.delete('role')
    else url.searchParams.set('role', r)
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>
}

export const useRole = () => useContext(RoleCtx)

const ICONS: Record<Role, ReactNode> = {
  recruiter: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  analyst: <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  engineer: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
}

export function RoleTabs() {
  const { role, setRole } = useRole()

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <span className="text-[15px] text-smoke">Viewing as</span>
      <div className="flex gap-2 sm:gap-3" role="group" aria-label="Tailor this page for">
        {(Object.keys(ROLES) as Role[]).map((r) => {
          const active = r === role
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => setRole(r)}
              className={`role-tab ${active ? 'is-active' : ''}`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="hidden h-[18px] w-[18px] sm:block" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[r]}
              </svg>
              <span className="hidden sm:inline">{ROLES[r].label}</span>
              <span className="sm:hidden">{ROLES[r].short}</span>
              <span aria-hidden className="role-dot" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

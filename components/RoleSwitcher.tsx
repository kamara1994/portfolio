'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

type Role = 'recruiter' | 'analyst' | 'engineer'

const roles: { id: Role; label: string; icon: string; color: string; desc: string }[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    icon: '📋',
    color: '#00d4ff',
    desc: 'Certs, resume, flagship projects, contact',
  },
  {
    id: 'analyst',
    label: 'SOC Analyst',
    icon: '🛡️',
    color: '#00f5d4',
    desc: 'BLUE SOC, incident replay, Splunk, detection',
  },
  {
    id: 'engineer',
    label: 'Security Engineer',
    icon: '⚙️',
    color: '#a855f7',
    desc: 'Architecture, automation, APIs, cloud, code',
  },
]

const roleContent: Record<Role, { headline: string; highlights: string[] }> = {
  recruiter: {
    headline: 'Security+ · PenTest+ · CCNA · PSAA certified. Available May 2026. Philadelphia, PA.',
    highlights: [
      'View resume and certifications',
      'Explore flagship projects',
      'See the Recruiter Briefing',
      'Contact Joseph directly',
    ],
  },
  analyst: {
    headline: 'Splunk SIEM · n8n Orchestration · AI-Assisted Triage · MITRE ATT&CK · Incident Response',
    highlights: [
      'BLUE SOC architecture and evidence',
      'Interactive Incident Replay Lab',
      'Phishing, C2, and cloud investigation walkthroughs',
      'SOC automation decision log',
    ],
  },
  engineer: {
    headline: 'AWS · Terraform · PyTorch · Claude API · Python · Next.js · Docker · REST APIs',
    highlights: [
      'FORTRESS v2 — Terraform IaC cloud security lab',
      'BLUE-X — PyTorch threat classifier',
      'Production readiness analysis',
      'GitHub repositories and architecture diagrams',
    ],
  },
}

export default function RoleSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeRole, setActiveRole] = useState<Role>('recruiter')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const role = searchParams.get('role') as Role | null
    if (role && ['recruiter', 'analyst', 'engineer'].includes(role)) {
      setActiveRole(role)
    }
  }, [searchParams])

  const selectRole = (role: Role) => {
    setActiveRole(role)
    const url = new URL(window.location.href)
    url.searchParams.set('role', role)
    router.replace(url.pathname + url.search, { scroll: false })
  }

  if (dismissed) return null

  const current = roles.find(r => r.id === activeRole)!
  const content = roleContent[activeRole]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.02)]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Label */}
          <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase shrink-0">
            Viewing as:
          </div>

          {/* Role buttons */}
          <div className="flex gap-1 flex-wrap">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => selectRole(role.id)}
                className="flex items-center gap-2 font-mono text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 border transition-all duration-200"
                style={{
                  borderColor: activeRole === role.id ? `${role.color}60` : 'rgba(0,212,255,0.12)',
                  color: activeRole === role.id ? role.color : '#8899bb',
                  background: activeRole === role.id ? `${role.color}10` : 'transparent',
                }}
              >
                <span>{role.icon}</span>
                {role.label}
                {activeRole === role.id && (
                  <motion.span
                    layoutId="activeRole"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: role.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="ml-auto font-mono text-[9px] text-muted hover:text-cyan transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Role context */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-[rgba(0,212,255,0.08)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <p className="font-mono text-[10px] text-muted leading-relaxed mb-2">
                  <span style={{ color: current.color }}>Showing you: </span>
                  {content.headline}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {content.highlights.map((h, i) => (
                    <span key={i} className="font-mono text-[9px] text-muted flex items-center gap-1">
                      <span style={{ color: current.color }}>▸</span> {h}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-mono text-[9px] text-muted shrink-0 sm:text-right">
                <div className="mb-1">Share this view:</div>
                <span className="text-cyan text-[9px]">
                  josephkamara.vercel.app?role={activeRole}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

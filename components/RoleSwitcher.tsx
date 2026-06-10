'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

type Role = 'recruiter' | 'analyst' | 'engineer'

const roles: { id: Role; label: string; icon: string; color: string; desc: string }[] = [
  { id: 'recruiter', label: 'Recruiter',         icon: '📋', color: '#00d4ff', desc: 'Certs, resume, flagship projects, contact' },
  { id: 'analyst',   label: 'SOC Analyst',       icon: '🛡️', color: '#00f5d4', desc: 'BLUE SOC, incident replay, Splunk, detection' },
  { id: 'engineer',  label: 'Security Engineer', icon: '⚙️', color: '#a855f7', desc: 'Architecture, automation, APIs, cloud, code' },
]

const roleContent: Record<Role, { headline: string; highlights: string[] }> = {
  recruiter: {
    headline: 'Security+ · PenTest+ · CCNA · PSAA certified. Available May 2026. Philadelphia, PA.',
    highlights: ['View resume and certifications', 'Explore flagship projects', 'See the Recruiter Briefing', 'Contact Joseph directly'],
  },
  analyst: {
    headline: 'Splunk SIEM · n8n Orchestration · AI-Assisted Triage · MITRE ATT&CK · Incident Response',
    highlights: ['BLUE SOC architecture and evidence', 'Interactive Incident Replay Lab', 'Phishing, C2, and cloud investigation walkthroughs', 'SOC automation decision log'],
  },
  engineer: {
    headline: 'AWS · Terraform · PyTorch · Claude API · Python · Next.js · Docker · REST APIs',
    highlights: ['FORTRESS v2 — Terraform IaC cloud security lab', 'BLUE-X — PyTorch threat classifier', 'Production readiness analysis', 'GitHub repositories and architecture diagrams'],
  },
}

/* ── LED edge ── */
function LedEdge({ position = 'top', colors = ['#00d4ff', '#00f5d4', '#818cf8'], width = 80, speed = 6, blur = 2.5 }) {
  const isTop = position === 'top'
  const inset = `${(100 - width) / 2}%`
  return (
    <>
      <div style={{
        position: 'absolute', [isTop ? 'top' : 'bottom']: -2, left: inset, right: inset, height: 5,
        background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 25%, ${colors[1]} 50%, ${colors[2]} 75%, transparent 100%)`,
        filter: `blur(${blur}px)`, opacity: 0.65, pointerEvents: 'none', zIndex: 1,
      }} />
      <motion.div
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', [isTop ? 'top' : 'bottom']: 0, left: inset, right: inset, height: 1.2,
          background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}, ${colors[1]}, transparent)`,
          backgroundSize: '200% 100%',
          boxShadow: `0 0 5px ${colors[0]}, 0 0 12px ${colors[0]}55`,
          pointerEvents: 'none', borderRadius: 1, zIndex: 2,
        }}
      />
    </>
  )
}

export default function RoleSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeRole, setActiveRole] = useState<Role>('recruiter')
  const [dismissed, setDismissed]   = useState(false)

  useEffect(() => {
    const role = searchParams.get('role') as Role | null
    if (role && ['recruiter', 'analyst', 'engineer'].includes(role)) setActiveRole(role)
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
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative px-6 py-5 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(0,212,255,0.05), rgba(2,8,24,0.4))',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      <LedEdge position="bottom" colors={['#00d4ff', '#00f5d4', '#818cf8']} width={92} speed={9} blur={3} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Label */}
          <div className="font-mono font-bold tracking-[2.5px] uppercase shrink-0" style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
            Viewing as:
          </div>

          {/* Role glass tabs */}
          <div style={{ perspective: 1000 }} className="flex gap-2.5 flex-wrap">
            {roles.map((role, idx) => {
              const isActive = activeRole === role.id
              const restTilt = idx === 0 ? -4 : idx === 1 ? 0 : 4
              return (
                <motion.button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  initial={false}
                  animate={{ rotateY: isActive ? 0 : restTilt, rotateX: isActive ? 0 : 2, scale: isActive ? 1.04 : 1 }}
                  whileHover={{ rotateY: 0, rotateX: 0, scale: 1.1, y: -3 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="relative overflow-hidden flex items-center gap-2 font-mono font-bold cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    fontSize: 10, padding: '8px 14px', letterSpacing: 1.5, textTransform: 'uppercase',
                    color: isActive ? role.color : 'rgba(255,255,255,0.55)',
                    background: isActive
                      ? `linear-gradient(135deg, ${role.color}26 0%, ${role.color}08 60%, rgba(0,0,0,0.25) 100%)`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.3))',
                    backdropFilter: 'blur(14px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                    border: `1.2px solid ${isActive ? role.color + '70' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: 9,
                    boxShadow: isActive
                      ? `inset 0 1.5px 0 rgba(255,255,255,0.4), 0 8px 22px rgba(0,0,0,0.4), 0 0 22px ${role.color}40`
                      : 'inset 0 1px 0 rgba(255,255,255,0.22), 0 5px 14px rgba(0,0,0,0.35)',
                    outline: 'none',
                  }}
                >
                  <LedEdge position="top" colors={[role.color, role.color, role.color]} width={70} speed={5} blur={2} />
                  <span style={{ position: 'relative', zIndex: 3, fontSize: 13 }}>{role.icon}</span>
                  <span className="relative" style={{ zIndex: 3 }}>{role.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeRoleDot"
                      className="relative"
                      style={{ width: 5, height: 5, borderRadius: '50%', background: role.color, boxShadow: `0 0 6px ${role.color}`, zIndex: 3 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Dismiss — glass icon */}
          <motion.button
            onClick={() => setDismissed(true)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="ml-auto relative overflow-hidden font-mono shrink-0 cursor-pointer"
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.5)',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.25))',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 3px 10px rgba(0,0,0,0.3)',
              outline: 'none',
            }}
          >
            ✕
          </motion.button>
        </div>

        {/* Role context — subtle glass card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.08)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <p className="font-mono leading-relaxed mb-2" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ color: current.color }}>Showing you: </span>
                  {content.headline}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {content.highlights.map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="font-mono flex items-center gap-1.5"
                      style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)' }}
                    >
                      <span style={{ color: current.color, textShadow: `0 0 6px ${current.color}` }}>▸</span> {h}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className="font-mono shrink-0 sm:text-right" style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                <div className="mb-1">Share this view:</div>
                <span style={{ color: current.color }}>josephkamara.vercel.app?role={activeRole}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

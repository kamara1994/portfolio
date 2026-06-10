'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const roles = [
  { title: 'SOC Analyst',           icon: '🛡️', color: '#00d4ff', desc: 'Threat detection · Alert triage · SIEM · Incident response' },
  { title: 'Security Engineer',     icon: '⚙️', color: '#00f5d4', desc: 'Security automation · Architecture · Defense systems' },
  { title: 'Cloud Security Eng.',   icon: '☁️', color: '#0099ff', desc: 'AWS · Terraform · GuardDuty · IAM · CloudTrail' },
  { title: 'AI Security Engineer',  icon: '🤖', color: '#a855f7', desc: 'LLM integration · AI-assisted triage · RAG pipelines' },
  { title: 'Penetration Tester',    icon: '🎯', color: '#ef4444', desc: 'PenTest+ · Metasploit · Burp Suite · OSINT' },
]

const details = [
  { label: 'Available',   val: 'Immediately',                     highlight: true  },
  { label: 'Work Mode',   val: 'Remote-first · Hybrid OK',        highlight: false },
  { label: 'Location',    val: 'Philadelphia, PA',                 highlight: false },
  { label: 'Relocate',    val: 'Open for the right role',         highlight: false },
  { label: 'Response',    val: '< 24 hours',                      highlight: true  },
  { label: 'Work Auth',   val: 'U.S. Work Authorized',            highlight: false },
]

export default function HireMe() {
  const [time, setTime] = useState('')
  const [hoveredRole, setHoveredRole] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <section className="relative px-6 py-24 overflow-hidden border-t border-[rgba(0,212,255,0.08)]">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Corner brackets */}
      <span className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-[rgba(0,245,212,0.25)] pointer-events-none" />
      <span className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-[rgba(0,245,212,0.25)] pointer-events-none" />
      <span className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-[rgba(0,245,212,0.25)] pointer-events-none" />
      <span className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-[rgba(0,245,212,0.25)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* ── AVAILABLE NOW hero badge ── */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative mb-8 inline-flex"
          >
            {/* Outer pulsing rings */}
            {[1.6, 2.1, 2.6].map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-sm border border-neon pointer-events-none"
                style={{
                  transform: `scale(${s})`,
                  opacity: 0.12 / (i + 1),
                  animation: `hmRingPulse ${2.2 + i * 0.7}s ease-in-out infinite ${i * 0.35}s`,
                }}
              />
            ))}

            {/* Badge */}
            <div
              className="relative flex items-center gap-3 px-8 py-3 border border-neon"
              style={{ background: 'rgba(0,245,212,0.07)', boxShadow: '0 0 30px rgba(0,245,212,0.12)' }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full bg-neon shrink-0"
                style={{ boxShadow: '0 0 12px #00f5d4', animation: 'hmRingPulse 1.3s ease-in-out infinite' }}
              />
              <span className="font-orbitron text-sm font-black text-neon tracking-[5px] uppercase">
                Available Now
              </span>
              <span className="font-mono text-muted" style={{ fontSize: 9 }}>{time}</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-orbitron font-black text-[#e2eaff] mb-4 leading-tight"
            style={{ fontSize: 'clamp(28px,4vw,46px)' }}
          >
            Let's Build <span className="text-cyan">Something</span> Secure
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-mono text-muted max-w-xl leading-relaxed"
            style={{ fontSize: 13 }}
          >
            Philadelphia, PA · Remote-first · Available immediately for any role below
          </motion.p>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Role cards */}
          <div>
            <div className="font-mono text-muted tracking-[3px] uppercase mb-4" style={{ fontSize: 9 }}>
              Target Roles
            </div>
            <div className="space-y-2.5">
              {roles.map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative flex items-center gap-4 px-5 py-4 cursor-default overflow-hidden transition-all duration-300"
                  style={{
                    border: `1px solid ${hoveredRole === i ? role.color + '50' : role.color + '1a'}`,
                    background: hoveredRole === i ? `${role.color}09` : `${role.color}04`,
                  }}
                  onMouseEnter={() => setHoveredRole(i)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-all duration-300"
                    style={{
                      width: hoveredRole === i ? 3 : 2,
                      background: role.color,
                      boxShadow: hoveredRole === i ? `0 0 12px ${role.color}` : 'none',
                    }}
                  />

                  <span className="text-xl shrink-0 ml-1">{role.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-orbitron text-sm font-bold" style={{ color: role.color }}>
                      {role.title}
                    </div>
                    <div className="font-mono text-muted mt-0.5 truncate" style={{ fontSize: 9 }}>
                      {role.desc}
                    </div>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                    style={{
                      background: role.color,
                      boxShadow: hoveredRole === i ? `0 0 10px ${role.color}` : `0 0 4px ${role.color}60`,
                      transform: hoveredRole === i ? 'scale(1.5)' : 'scale(1)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT — Contact card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div
              className="p-6"
              style={{
                border: '1px solid rgba(0,245,212,0.15)',
                background: 'rgba(0,245,212,0.03)',
                boxShadow: '0 0 40px rgba(0,245,212,0.04)',
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-neon" style={{ animation: 'hmRingPulse 1.6s ease-in-out infinite', boxShadow: '0 0 8px #00f5d4' }} />
                <span className="font-mono text-neon tracking-[3px] uppercase" style={{ fontSize: 9 }}>Open to Work</span>
              </div>

              <div className="space-y-0">
                {details.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3"
                    style={{ borderBottom: i < details.length - 1 ? '1px solid rgba(0,212,255,0.06)' : 'none' }}
                  >
                    <span className="font-mono text-muted" style={{ fontSize: 10 }}>{d.label}</span>
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: d.highlight ? '#00f5d4' : '#e2eaff' }}
                    >
                      {d.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <a
                  href="mailto:kamarajosephallan@gmail.com"
                  className="flex-1 text-center font-mono tracking-[2px] uppercase py-3 bg-cyan text-bg hover:bg-neon transition-colors"
                  style={{ fontSize: 11 }}
                >
                  Email Me →
                </a>
                <a
                  href="https://linkedin.com/in/joseph-allan-kamara"
                  target="_blank"
                  className="flex-1 text-center font-mono tracking-[2px] uppercase py-3 border border-[rgba(0,212,255,0.3)] text-cyan hover:border-cyan transition-colors"
                  style={{ fontSize: 11 }}
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>

            {/* Resume download */}
            <motion.a
              href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf"
              target="_blank"
              className="flex items-center justify-between w-full px-5 py-4 border transition-all duration-300 group"
              style={{ borderColor: 'rgba(129,140,248,0.2)', background: 'rgba(129,140,248,0.04)' }}
              whileHover={{ borderColor: 'rgba(129,140,248,0.5)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div>
                  <div className="font-mono text-purple-400" style={{ fontSize: 11 }}>Download Resume</div>
                  <div className="font-mono text-muted" style={{ fontSize: 9 }}>Joseph_Allan_Kamara_Resume_v3.pdf</div>
                </div>
              </div>
              <span className="font-mono text-purple-400 group-hover:translate-x-1 transition-transform" style={{ fontSize: 14 }}>↓</span>
            </motion.a>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes hmRingPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 1; }
        }
      `}</style>
    </section>
  )
}

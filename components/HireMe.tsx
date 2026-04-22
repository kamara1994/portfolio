'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function HireMe() {
  const [days, setDays] = useState(0)

  useEffect(() => {
    const target = new Date('2026-05-01')
    const diff = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
    setDays(diff)
  }, [])

  const roles = [
    { title: 'SOC Analyst', icon: '🛡️', color: '#00d4ff' },
    { title: 'Security Engineer', icon: '⚙️', color: '#00f5d4' },
    { title: 'Cloud Security Engineer', icon: '☁️', color: '#0099ff' },
    { title: 'AI Security Engineer', icon: '🤖', color: '#aa44ff' },
    { title: 'Penetration Tester', icon: '🎯', color: '#ff4444' },
  ]

  return (
    <section className="px-6 py-20 border-t border-[rgba(0,212,255,0.08)]">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">Available for hire</div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-12">Let&apos;s <span className="text-cyan">Work Together</span></h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card p-6 border border-[rgba(0,245,212,0.15)]" style={{ boxShadow: '0 0 30px rgba(0,245,212,0.05)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-neon animate-pulse" />
              <span className="font-mono text-[11px] text-neon tracking-[3px] uppercase">Open To Work</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Available</div>
                <div className="font-mono text-sm text-[#e2eaff]">{days > 0 ? `In ${days} days · May 2026` : 'Immediately Available'}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Work Preference</div>
                <div className="font-mono text-sm text-[#e2eaff]">Remote-first · Open to Hybrid</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Location</div>
                <div className="font-mono text-sm text-[#e2eaff]">Philadelphia, PA · Relocate for right role</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Response Time</div>
                <div className="font-mono text-sm text-neon">{'< 24 hours'}</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[rgba(0,212,255,0.08)] flex flex-wrap gap-3">
              <a href="mailto:kamarajosephallan@gmail.com"
                className="btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:bg-neon transition-colors">
                Email Me →
              </a>
              <a href="https://linkedin.com/in/joseph-allan-kamara" target="_blank"
                className="btn-hex border border-[rgba(0,212,255,0.3)] text-cyan font-mono text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:border-cyan transition-colors">
                LinkedIn ↗
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-3">
            <div className="font-mono text-[10px] text-muted tracking-[2px] uppercase mb-4">Target Roles</div>
            {roles.map((role, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card px-5 py-4 flex items-center gap-4 hover:border-[rgba(0,212,255,0.2)] transition-colors">
                <span className="text-xl">{role.icon}</span>
                <div className="flex-1"><div className="font-orbitron text-sm font-bold" style={{ color: role.color }}>{role.title}</div></div>
                <div className="w-2 h-2 rounded-full" style={{ background: role.color, boxShadow: `0 0 6px ${role.color}` }} />
              </motion.div>
            ))}
            <div className="glass-card px-5 py-4 mt-2">
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-2">Resume</div>
              <a href="/resume/Joseph_Allan_Kamara_Resume.pdf" download
                className="flex items-center gap-2 font-mono text-[11px] text-cyan hover:text-neon transition-colors">
                <span>↓</span><span>Download Resume (PDF)</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const experiences = [
  {
    company: 'BYU-Idaho IT Help Desk',
    role: 'IT Support Technician',
    dates: '2025 — Present',
    current: true,
    color: '#00f5d4',
    icon: '🖥️',
    tags: ['Windows Enterprise', 'Incident Escalation', 'Technical Documentation', 'End-User Support'],
    bullets: [
      'Administered endpoint systems across enterprise Windows environment supporting 10,000+ users — resolving hardware, software, and network issues across campus departments.',
      'Resolved 20+ support tickets weekly with 95%+ first-contact resolution rate, maintaining detailed records in the ticketing system.',
      'Identified and escalated security-adjacent incidents including unauthorized access attempts, suspicious endpoint behavior, and anomalous network activity.',
      'Maintained technical documentation and generated incident reports aligned with IT compliance and audit requirements.',
    ],
    impact: '10,000+ users supported · 95% first-contact resolution · Security incident escalation',
  },
  {
    company: 'ELITECOM Engineers Sierra Leone',
    role: 'Web Security Developer & Technology Lead',
    dates: '2024 — Present',
    current: true,
    color: '#a855f7',
    icon: '🏢',
    tags: ['Next.js', 'Security Headers', 'Web Architecture', 'Technology Strategy'],
    bullets: [
      'Designed and developed the full company web platform for a multi-sector engineering firm spanning telecom, IT, and civil engineering — built with Next.js, Tailwind CSS, and security-first architecture.',
      'Implemented security headers (CSP, HSTS, XSS protection), HTTPS enforcement, and secure deployment practices across all web infrastructure.',
      'Defined cybersecurity guidelines and digital security controls for the organization\'s operations and client-facing systems.',
      'Delivered full production website serving international audiences at elitecomengineers.com.',
    ],
    impact: 'Full production delivery · Security-first architecture · International audience',
  },
  {
    company: 'Heber J. Grant Peer Mentoring — BYU-Idaho',
    role: 'Project Coordinator',
    dates: '2024 — 2025',
    current: false,
    color: '#38bdf8',
    icon: '📋',
    tags: ['Program Operations', 'Data Integrity', 'Cross-team Communication', 'Compliance'],
    bullets: [
      'Coordinated program operations, scheduling, and compliance documentation across a campus-wide peer mentoring initiative.',
      'Maintained data integrity and cross-team communication workflows across mentoring program operations.',
    ],
    impact: 'Campus-wide program coordination · Compliance documentation',
  },
]

export default function Experience() {
  return (
    <section id="experience" className="relative z-10 py-28 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Work History" title="Experi" accent="ence" />

        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 hover:border-[rgba(0,212,255,0.2)] transition-all duration-300 relative overflow-hidden group"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${exp.color}60, transparent)` }} />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Left — dates and status */}
                <div className="md:col-span-1">
                  <div className="text-3xl mb-3">{exp.icon}</div>
                  <div className="font-mono text-[11px] text-muted tracking-wide mb-2">{exp.dates}</div>
                  {exp.current && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
                      <span className="font-mono text-[9px] text-neon tracking-wider">CURRENT</span>
                    </div>
                  )}

                  {/* Impact badge */}
                  <div className="border p-3 mt-4" style={{ borderColor: `${exp.color}30`, background: `${exp.color}06` }}>
                    <div className="font-mono text-[8px] tracking-[2px] uppercase mb-1" style={{ color: exp.color }}>
                      Impact
                    </div>
                    <div className="font-mono text-[9px] text-muted leading-relaxed">
                      {exp.impact}
                    </div>
                  </div>
                </div>

                {/* Right — content */}
                <div className="md:col-span-3">
                  <div className="font-mono text-[11px] uppercase tracking-[2px] mb-1" style={{ color: exp.color }}>
                    {exp.company}
                  </div>
                  <div className="font-orbitron text-xl font-bold text-[#e2eaff] mb-4">{exp.role}</div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {exp.tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] px-2.5 py-1 border border-[rgba(0,212,255,0.12)] text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-3">
                    {exp.bullets.map((b, bi) => (
                      <motion.li
                        key={bi}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + bi * 0.05 }}
                        className="text-[14px] text-muted leading-relaxed flex gap-3"
                      >
                        <span className="text-[10px] mt-1.5 shrink-0" style={{ color: exp.color }}>▸</span>
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 p-4 border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)] flex items-center justify-between flex-wrap gap-4"
        >
          <p className="font-mono text-[10px] text-muted">
            All projects and certifications were built and earned alongside full-time coursework and work commitments.
          </p>
          <a
            href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf"
            target="_blank"
            className="font-mono text-[10px] tracking-[2px] uppercase text-cyan hover:text-neon transition-colors"
          >
            ↓ Full Resume
          </a>
        </motion.div>
      </div>
    </section>
  )
}

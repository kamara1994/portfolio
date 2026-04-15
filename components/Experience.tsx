'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'
import { experiences } from '@/data/index'

export default function Experience() {
  return (
    <section id="experience" className="relative z-10 py-28 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Work History" title="Experi" accent="ence" />
        <div className="flex flex-col gap-px bg-[rgba(0,212,255,0.05)]">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-6 hover:border-[rgba(0,212,255,0.2)] transition-colors"
            >
              <div className="md:col-span-1">
                <div className="font-mono text-[11px] text-muted tracking-wide">{exp.dates}</div>
                {exp.current && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
                    <span className="font-mono text-[9px] text-neon tracking-wider">CURRENT</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-3">
                <div className="font-mono text-[11px] text-cyan uppercase tracking-[2px] mb-1">{exp.company}</div>
                <div className="font-orbitron text-xl font-bold text-[#e2eaff] mb-5">{exp.role}</div>
                <ul className="space-y-2.5">
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} className="text-[14px] text-muted leading-relaxed flex gap-3">
                      <span className="text-cyan text-[10px] mt-1.5 shrink-0">—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

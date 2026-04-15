'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'
import { skillGroups } from '@/data/index'

export default function Skills() {
  return (
    <section id="skills" className="relative z-10 py-28 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Technical Arsenal" title="Core " accent="Skills" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(0,212,255,0.05)]">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-7 hover:border-[rgba(0,212,255,0.25)] transition-colors"
            >
              <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-5 pb-3 border-b border-[rgba(0,212,255,0.1)]">
                {group.title}
              </div>
              <div className="space-y-2.5">
                {group.skills.map(skill => (
                  <div key={skill} className="flex items-center gap-2.5 text-[13px] text-muted">
                    <span className="text-cyan text-[9px]">▸</span>
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

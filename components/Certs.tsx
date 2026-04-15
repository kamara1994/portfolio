'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'
import { certs } from '@/data/index'

export default function Certs() {
  return (
    <section id="certs" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Credentials" title="Certifi" accent="cations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(0,212,255,0.05)]">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 relative overflow-hidden flex flex-col gap-3 hover:border-[rgba(0,212,255,0.3)] transition-all ${cert.status === 'progress' ? 'opacity-60' : ''}`}
            >
              {/* Bottom shimmer line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-0 group-hover:opacity-100" />

              <div className="font-mono text-[10px] tracking-[2px] uppercase text-purple2">{cert.issuer}</div>
              <div className="font-orbitron text-lg font-bold text-[#e2eaff] leading-tight">{cert.name}</div>
              {cert.date && <div className="font-mono text-[10px] text-muted">{cert.date}</div>}
              {cert.certNum && <div className="font-mono text-[10px] text-muted">#{cert.certNum}</div>}

              <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 w-fit mt-1 ${
                cert.status === 'earned'
                  ? 'bg-[rgba(0,245,212,0.08)] border border-[rgba(0,245,212,0.25)] text-neon'
                  : 'bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.2)] text-yellow-400'
              }`}>
                {cert.status === 'earned' ? '✓ Earned' : '⟳ In Progress'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

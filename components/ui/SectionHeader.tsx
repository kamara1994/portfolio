'use client'
import { motion } from 'framer-motion'

interface SectionHeaderProps {
  label: string
  title: string
  accent?: string
  center?: boolean
}

export default function SectionHeader({ label, title, accent, center }: SectionHeaderProps) {
  const parts = accent ? title.split(accent) : [title]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={center ? 'text-center' : ''}
    >
      <div className={`flex items-center gap-3 mb-3 font-mono text-[11px] text-neon tracking-[4px] uppercase ${center ? 'justify-center' : ''}`}>
        {!center && <span className="block w-10 h-px bg-neon" />}
        {label}
        {center && <span className="block w-10 h-px bg-neon" />}
      </div>
      <h2 className="font-orbitron text-4xl md:text-5xl font-black tracking-tight mb-14 text-[#e2eaff]">
        {parts[0]}
        {accent && <span className="text-cyan">{accent}</span>}
        {parts[1]}
      </h2>
    </motion.div>
  )
}

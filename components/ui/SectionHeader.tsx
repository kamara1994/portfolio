'use client'
import { motion } from 'framer-motion'

interface SectionHeaderProps {
  label: string
  title: string
  accent: string
}

const waveColors = [
  '#00f5d4', '#00d4ff', '#818cf8', '#a855f7',
  '#ef4444', '#f59e0b', '#00f5d4',
]

export default function SectionHeader({ label, title, accent }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      {/* Label with wave dot */}
      <div className="flex items-center gap-3 font-mono text-[10px] tracking-[4px] uppercase mb-3">
        <motion.span
          className="w-8 h-px"
          animate={{ backgroundColor: waveColors }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          animate={{ color: waveColors }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.span>
        <motion.span
          className="w-2 h-2 rounded-full"
          animate={{
            backgroundColor: waveColors,
            boxShadow: waveColors.map(c => `0 0 8px ${c}, 0 0 16px ${c}50`),
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Title with bold + wave accent word */}
      <h2 className="font-orbitron font-black text-3xl text-[#e2eaff] mb-2 flex items-baseline gap-0 flex-wrap">
        <span className="font-black">{title}</span>
        <motion.span
          className="font-black relative"
          animate={{ color: waveColors }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {accent}
          {/* Moving wave underline */}
          <span className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <motion.span
              className="absolute top-0 left-0 h-full w-[200%]"
              style={{
                background: 'linear-gradient(90deg, #00f5d4, #00d4ff, #818cf8, #a855f7, #ef4444, #f59e0b, #00f5d4, #00d4ff)',
              }}
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </span>
        </motion.span>
      </h2>
    </div>
  )
}

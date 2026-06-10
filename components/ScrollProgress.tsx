'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  { id: 'hero',       label: 'HERO',       color: '#00d4ff' },
  { id: 'projects',   label: 'PROJECTS',   color: '#00f5d4' },
  { id: 'skills',     label: 'SKILLS',     color: '#818cf8' },
  { id: 'certs',      label: 'CERTS',      color: '#a855f7' },
  { id: 'experience', label: 'EXPERIENCE', color: '#f59e0b' },
  { id: 'about',      label: 'ABOUT',      color: '#38bdf8' },
  { id: 'contact',    label: 'CONTACT',    color: '#00f5d4' },
]

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [ticks, setTicks] = useState<number[]>([])
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const calcTicks = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      if (docH <= 0) return
      const pts = SECTIONS.map(s => {
        const el = document.getElementById(s.id)
        return el ? (el.offsetTop / docH) * 100 : -1
      }).filter(p => p >= 0)
      setTicks(pts)
    }

    const onScroll = () => {
      const scrollTop = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docH > 0 ? (scrollTop / docH) * 100 : 0)
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id)
        if (el && scrollTop >= el.offsetTop - 300) {
          setActiveSection(s.id)
          break
        }
      }
    }

    calcTicks()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', calcTicks)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', calcTicks)
    }
  }, [])

  const active = SECTIONS.find(s => s.id === activeSection)

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-[rgba(0,212,255,0.05)]">
        {/* Gradient fill */}
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d4ff 0%, #00f5d4 30%, #818cf8 60%, #a855f7 85%, #f59e0b 100%)',
            boxShadow: `0 0 10px ${active?.color || '#00d4ff'}80`,
            transition: 'width 0.08s linear',
          }}
        />
        {/* Section tick marks */}
        {ticks.slice(1).map((pct, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-[1px]"
            style={{ left: `${pct}%`, background: 'rgba(0,212,255,0.22)' }}
          />
        ))}
        {/* Glowing tip dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full transition-[left] duration-75"
          style={{
            left: `${progress}%`,
            background: active?.color || '#00d4ff',
            boxShadow: `0 0 10px ${active?.color || '#00d4ff'}, 0 0 4px white`,
            opacity: progress > 1 ? 1 : 0,
          }}
        />
      </div>

      {/* Section label */}
      <AnimatePresence mode="wait">
        {activeSection && progress > 4 && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[199] top-[7px] right-5 font-mono tracking-[3px] pointer-events-none"
            style={{ fontSize: 7, color: active?.color || '#00d4ff' }}
          >
            {active?.label}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

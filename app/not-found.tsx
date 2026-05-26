'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const lines = [
  { text: '> INITIALIZING SCAN...', delay: 0, color: '#00d4ff' },
  { text: '> TARGET: requested-page.tsx', delay: 300, color: '#8899bb' },
  { text: '> STATUS: 404 — RESOURCE NOT FOUND', delay: 700, color: '#ef4444' },
  { text: '> THREAT LEVEL: LOW (just a missing page)', delay: 1100, color: '#f59e0b' },
  { text: '> INITIATING REDIRECT PROTOCOL...', delay: 1500, color: '#00f5d4' },
]

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, line.delay)
    })
    setTimeout(() => setShowButtons(true), 2000)
  }, [])

  return (
    <main className="min-h-screen bg-[#020818] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute w-96 h-96 rounded-full opacity-10 top-0 left-0"
        style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 w-full max-w-xl">
        {/* 404 display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="font-orbitron font-black text-[120px] leading-none text-transparent bg-clip-text mb-2"
            style={{ backgroundImage: 'linear-gradient(135deg, #ef4444, #f97316, #f59e0b)' }}>
            404
          </div>
          <div className="font-mono text-[12px] text-muted tracking-[4px] uppercase">
            Page Not Found — Sector Compromised
          </div>
        </motion.div>

        {/* Terminal */}
        <div className="terminal-box mb-6">
          <div className="terminal-bar">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-400" />
            <div className="terminal-dot bg-green-400" />
            <span className="font-mono text-[10px] text-muted ml-2">jak@blue-soc — error.log</span>
          </div>
          <div className="p-5 font-mono text-[12px] leading-7 min-h-[160px]">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
                style={{ color: line.color }}
              >
                {line.text}
                {i === visibleLines[visibleLines.length - 1] && !showButtons && (
                  <span className="blink">_</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <AnimatePresenceWrapper show={showButtons}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/"
              className="flex-1 text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors">
              ← Return to Base
            </Link>
            <Link href="/incident-replay"
              className="flex-1 text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 border border-[rgba(0,245,212,0.4)] text-neon hover:bg-[rgba(0,245,212,0.08)] transition-colors flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              Incident Lab
            </Link>
            <Link href="/#projects"
              className="flex-1 text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 border border-[rgba(0,212,255,0.2)] text-cyan hover:border-cyan transition-colors">
              View Projects
            </Link>
          </motion.div>
        </AnimatePresenceWrapper>
      </div>
    </main>
  )
}

// Small wrapper to avoid importing AnimatePresence in a non-client context
function AnimatePresenceWrapper({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return <>{children}</>
}

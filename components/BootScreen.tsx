'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const bootLines = [
  { text: 'INITIALIZING BLUE SOC SYSTEMS...', delay: 0, color: '#00f5d4' },
  { text: 'LOADING SECURITY MODULES...', delay: 400, color: '#00d4ff' },
  { text: 'CONNECTING TO THREAT INTELLIGENCE FEEDS...', delay: 800, color: '#00d4ff' },
  { text: 'CALIBRATING AI DETECTION ENGINE...', delay: 1200, color: '#818cf8' },
  { text: 'SPLUNK SIEM → ONLINE', delay: 1600, color: '#00f5d4' },
  { text: 'PALO ALTO FIREWALL → ACTIVE', delay: 1900, color: '#00f5d4' },
  { text: 'N8N ORCHESTRATION → RUNNING', delay: 2200, color: '#00f5d4' },
  { text: 'CLAUDE LLM API → CONNECTED', delay: 2500, color: '#818cf8' },
  { text: 'ALL SYSTEMS NOMINAL', delay: 2900, color: '#39ff14' },
  { text: 'WELCOME, OPERATOR.', delay: 3300, color: '#ffffff' },
]

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [exit, setExit] = useState(false)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    // Only show boot screen once per session
    const hasBooted = sessionStorage.getItem('jak-booted')
    if (hasBooted) {
      setSkip(true)
      onComplete()
      return
    }

    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
        setProgress(Math.round(((i + 1) / bootLines.length) * 100))
      }, line.delay)
    })

    setTimeout(() => {
      setDone(true)
      setTimeout(() => {
        setExit(true)
        sessionStorage.setItem('jak-booted', 'true')
        setTimeout(onComplete, 800)
      }, 600)
    }, 3900)
  }, [onComplete])

  if (skip) return null

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#020818] flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-50" />

          <div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)',
              animation: 'scan 3s linear infinite',
              top: 0,
            }}
          />

          <div className="absolute w-96 h-96 rounded-full opacity-10 top-0 left-0"
            style={{ background: 'radial-gradient(circle, #1e3a8a, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute w-96 h-96 rounded-full opacity-10 bottom-0 right-0"
            style={{ background: 'radial-gradient(circle, #0e7490, transparent 70%)', filter: 'blur(60px)' }} />

          <div className="relative z-10 w-full max-w-2xl px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div
                className="font-orbitron text-5xl font-black text-transparent bg-clip-text mb-2"
                style={{ backgroundImage: 'linear-gradient(90deg, #00d4ff, #00f5d4, #818cf8)' }}
              >
                JAK
              </div>
              <div className="font-mono text-[11px] text-muted tracking-[6px] uppercase">
                Security Operations Center
              </div>
            </motion.div>

            <div className="terminal-box w-full mb-8">
              <div className="terminal-bar">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2 tracking-wider">
                  jak@blue-soc — boot sequence
                </span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-7 min-h-[280px]">
                {bootLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                    style={{ color: line.color }}
                  >
                    <span style={{ color: '#00f5d4' }}>❯</span>
                    {line.text}
                    {i === visibleLines[visibleLines.length - 1] && !done && (
                      <span className="blink">_</span>
                    )}
                    {visibleLines.includes(i) && i < visibleLines[visibleLines.length - 1] && (
                      <span className="ml-auto text-[10px]" style={{ color: '#39ff14' }}>✓</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between font-mono text-[10px] text-muted mb-2">
                <span>BOOT PROGRESS</span>
                <span style={{ color: '#00d4ff' }}>{progress}%</span>
              </div>
              <div className="w-full h-1 bg-[rgba(0,212,255,0.1)] relative overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    background: 'linear-gradient(90deg, #00d4ff, #00f5d4)',
                    boxShadow: '0 0 10px rgba(0,212,255,0.8)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-4 font-mono text-[11px] tracking-[4px] uppercase"
                  style={{ color: '#39ff14' }}
                >
                  SYSTEM READY — LOADING PORTFOLIO
                </motion.div>
              )}
            </div>

            {/* Skip button */}
            <button
              onClick={() => {
                setExit(true)
                sessionStorage.setItem('jak-booted', 'true')
                setTimeout(onComplete, 400)
              }}
              className="absolute bottom-8 right-8 font-mono text-[9px] text-muted hover:text-cyan transition-colors tracking-[2px] uppercase"
            >
              Skip →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
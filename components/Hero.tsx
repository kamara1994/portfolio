'use client'
// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
const CertOrbit = dynamic(() => import('@/components/CertOrbit'), { ssr: false })

const roles = ['SOC Analyst', 'Security Engineer', 'AI Security Engineer', 'Cloud Security Engineer', 'Penetration Tester']

const statusItems = [
  { label: 'OPEN TO WORK',              color: '#00f5d4', pulse: true  },
  { label: 'SECURITY+',                 color: '#00d4ff', pulse: false },
  { label: 'PENTEST+',                  color: '#a855f7', pulse: false },
  { label: 'CCNA',                      color: '#00d4ff', pulse: false },
  { label: 'PSAA',                      color: '#818cf8', pulse: false },
  { label: 'BLUE SOC · LAB-VALIDATED',  color: '#00f5d4', pulse: false },
  { label: 'FORTRESS v2 · LAB-VALIDATED', color: '#ffaa00', pulse: false },
]

/* ── LED edge ── */
function LedEdge({ position = 'top', colors = ['#00d4ff', '#00f5d4', '#818cf8'], width = 80, speed = 6, blur = 2.5 }) {
  const isTop = position === 'top'
  const inset = `${(100 - width) / 2}%`
  return (
    <>
      <div style={{
        position: 'absolute', [isTop ? 'top' : 'bottom']: -2, left: inset, right: inset, height: 5,
        background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 25%, ${colors[1]} 50%, ${colors[2]} 75%, transparent 100%)`,
        filter: `blur(${blur}px)`, opacity: 0.65, pointerEvents: 'none', zIndex: 1,
      }} />
      <motion.div
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', [isTop ? 'top' : 'bottom']: 0, left: inset, right: inset, height: 1.2,
          background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}, ${colors[1]}, transparent)`,
          backgroundSize: '200% 100%',
          boxShadow: `0 0 5px ${colors[0]}, 0 0 12px ${colors[0]}55`,
          pointerEvents: 'none', borderRadius: 1, zIndex: 2,
        }}
      />
    </>
  )
}

/* ── Glass status pill ── */
function StatusPill({ item, idx }) {
  const tilt = idx % 2 === 0 ? -2 : 2
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, rotateY: tilt, rotateX: 1.5 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.08, y: -3 }}
      transition={{ delay: 0.1 + idx * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
      className="relative overflow-hidden font-mono font-bold flex items-center gap-1.5 shrink-0"
      style={{
        transformStyle: 'preserve-3d',
        fontSize: 8.5, padding: '6px 11px', letterSpacing: 1.5, textTransform: 'uppercase',
        color: item.color,
        background: `linear-gradient(135deg, ${item.color}1f 0%, ${item.color}06 60%, rgba(0,0,0,0.25) 100%)`,
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        border: `1px solid ${item.color}55`,
        borderRadius: 8,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 16px rgba(0,0,0,0.4), 0 0 14px ${item.color}22`,
      }}
    >
      <LedEdge position="top" colors={[item.color, item.color, item.color]} width={70} speed={6} blur={2} />
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: item.color,
        boxShadow: `0 0 6px ${item.color}`,
        animation: item.pulse ? 'heroPulse 2s ease-in-out infinite' : 'none',
      }} />
      <span className="relative" style={{ zIndex: 3 }}>{item.label}</span>
    </motion.div>
  )
}

/* ── Glass action button ── */
function GlassActionBtn({ href, target, primary, accent = '#00d4ff', accent2 = '#00f5d4', pulse, children, idx = 0 }) {
  return (
    <motion.a
      href={href} target={target}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, rotateY: -3, rotateX: 2 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.07, y: -4 }}
      transition={{ delay: 0.8 + idx * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden font-mono font-black inline-flex items-center gap-2 cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase',
        padding: '12px 22px', color: primary ? '#02101f' : '#fff',
        background: primary
          ? `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`
          : `linear-gradient(135deg, ${accent}26 0%, ${accent2}10 50%, rgba(0,0,0,0.25) 100%)`,
        backdropFilter: 'blur(16px) saturate(200%)',
        WebkitBackdropFilter: 'blur(16px) saturate(200%)',
        border: `1.4px solid ${primary ? accent2 : accent + '66'}`,
        borderRadius: 10,
        boxShadow: primary
          ? `inset 0 1.5px 0 rgba(255,255,255,0.55), 0 12px 26px rgba(0,0,0,0.45), 0 0 32px ${accent}55`
          : `inset 0 1.5px 0 rgba(255,255,255,0.32), 0 10px 22px rgba(0,0,0,0.4), 0 0 16px ${accent}33`,
      }}
    >
      <LedEdge position="top"    colors={[accent, '#fff', accent2]} width={80} speed={3.5} blur={3} />
      <LedEdge position="bottom" colors={[accent2, accent, accent]} width={80} speed={4.5} blur={3} />
      {pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent2, boxShadow: `0 0 8px ${accent2}`, animation: 'heroPulse 1.5s ease-in-out infinite' }} />}
      <span className="relative" style={{ zIndex: 3 }}>{children}</span>
    </motion.a>
  )
}

/* ── Glass stat cell ── */
function StatCell({ num, label, color, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, rotateY: idx % 2 === 0 ? -3 : 3 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.06, y: -3 }}
      transition={{ delay: 0.9 + idx * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
      className="relative overflow-hidden"
      style={{
        transformStyle: 'preserve-3d',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.3) 100%)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        border: `1px solid ${color}33`,
        borderRadius: 10,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 18px rgba(0,0,0,0.35), 0 0 14px ${color}1c`,
      }}
    >
      <LedEdge position="top" colors={[color, color, color]} width={70} speed={6} blur={2} />
      <div className="font-mono relative" style={{ fontSize: 22, color, lineHeight: 1, marginBottom: 4, zIndex: 3, textShadow: `0 0 8px ${color}66` }}>{num}</div>
      <div className="font-mono relative" style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', zIndex: 3 }}>{label}</div>
    </motion.div>
  )
}

export default function Hero() {
  const [roleIdx, setRoleIdx]     = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting]   = useState(false)
  const canvasRef                 = useRef<HTMLCanvasElement>(null)

  /* typing effect */
  useEffect(() => {
    const target = roles[roleIdx]
    let timer
    if (!deleting && displayed.length < target.length) {
      timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === target.length) {
      timer = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setRoleIdx((roleIdx + 1) % roles.length)
    }
    return () => clearTimeout(timer)
  }, [displayed, deleting, roleIdx])

  /* matrix canvas */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ABCDEF</>{}[]'
    const fontSize = 13
    const cols = Math.floor(canvas.width / fontSize)
    const drops = Array(cols).fill(1)
    const draw = () => {
      ctx.fillStyle = 'rgba(2,8,24,0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0,212,255,0.18)'
      ctx.font = `${fontSize}px Share Tech Mono`
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }
    const interval = setInterval(draw, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex flex-col pt-24 pb-16 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />

      {/* STATUS BAR — each item is a floating glass pill */}
      <div className="relative z-10 w-full px-6 mb-10" style={{ perspective: 1000 }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2.5">
          {statusItems.map((item, i) => <StatusPill key={i} item={item} idx={i} />)}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">

        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 font-mono text-[11px] text-neon tracking-[3px] uppercase mb-6"
          >
            <span className="w-8 h-px bg-neon" />
            Available for Roles · Open to Work
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse-slow" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-orbitron font-black leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(44px,7vw,82px)' }}
          >
            <span className="block text-[#e2eaff]">Joseph</span>
            <span className="block text-[#e2eaff]">Allan</span>
            <span className="block glitch-wrapper holo-text" data-text="Kamara">Kamara</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="font-mono text-lg text-cyan2 mb-6 h-7 flex items-center gap-1"
          >
            {displayed}
            <span className="blink text-neon">_</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="text-muted text-[15px] leading-relaxed max-w-xl mb-8"
          >
            From <span className="text-[#ffaa00] font-semibold">Sierra Leone</span> to the global stage —
            I design and build security automation systems connecting{' '}
            <span className="text-cyan font-semibold">SIEM detection</span>,{' '}
            <span className="text-neon font-semibold">cloud defense</span>, and{' '}
            <span className="text-purple-400 font-semibold">AI-assisted triage</span>{' '}
            into structured, analyst-reviewed response workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {['SOC Analyst', 'Security Engineer', 'AI Security Engineer', 'Pen Tester', 'Cloud Security'].map(r => (
              <span key={r} className="font-mono text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 border border-[rgba(129,140,248,0.25)] text-purple2 bg-[rgba(129,140,248,0.05)]">{r}</span>
            ))}
          </motion.div>

          {/* ACTION BUTTONS — all floating glass */}
          <div className="flex flex-wrap gap-4 mb-12" style={{ perspective: 1200 }}>
            <GlassActionBtn href="#projects"          primary  accent="#00d4ff" accent2="#00f5d4" idx={0}>View Projects</GlassActionBtn>
            <GlassActionBtn href="/incident-replay"            accent="#00f5d4" accent2="#a855f7" pulse idx={1}>Incident Lab</GlassActionBtn>
            <GlassActionBtn href="#briefing"                   accent="#00d4ff" accent2="#818cf8" idx={2}>Recruiter Briefing</GlassActionBtn>
            <GlassActionBtn href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf" target="_blank" accent="#ffaa00" accent2="#00d4ff" idx={3}>↓ Resume</GlassActionBtn>
          </div>

          {/* STATS GRID — glass cells */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg" style={{ perspective: 1200 }}>
            <StatCell num="5"      label="Certifications" color="#00d4ff" idx={0} />
            <StatCell num="11+"    label="Projects"       color="#00f5d4" idx={1} />
            <StatCell num="99.98%" label="AI Accuracy*"   color="#a855f7" idx={2} />
            <StatCell num="BS"     label="Cybersecurity"  color="#ffaa00" idx={3} />
          </div>
          <p className="font-mono text-[9px] text-muted mt-2 opacity-60">* Controlled labeled dataset — methodology documented in BLUE-X case study</p>
        </div>

        {/* RIGHT — Cert orbit */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <CertOrbit />
        </motion.div>
      </div>

      <style>{`
        @keyframes heroPulse { 0%, 100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}</style>
    </section>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const roles = ['SOC Analyst', 'Security Engineer', 'AI Security Engineer', 'Penetration Tester']

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // TYPEWRITER
  useEffect(() => {
    const target = roles[roleIdx]
    let timer: NodeJS.Timeout

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

  // MATRIX RAIN
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
    const drops: number[] = Array(cols).fill(1)

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
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden">

      {/* Matrix canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-3 font-mono text-[11px] text-neon tracking-[3px] uppercase mb-6"
          >
            <span className="w-8 h-px bg-neon" />
            Available for Roles · Open to Work
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse-slow" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-orbitron font-black leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(44px,7vw,82px)' }}
          >
            <span className="block text-[#e2eaff]">Joseph</span>
            <span className="block text-[#e2eaff]">Allan</span>
            <span
              className="block glitch-wrapper holo-text"
              data-text="Kamara"
            >Kamara</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="font-mono text-lg text-cyan2 mb-6 h-7 flex items-center gap-1"
          >
            {displayed}
            <span className="blink text-neon">_</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-muted text-[15px] leading-relaxed max-w-xl mb-8"
          >
            I build the systems that defend against threats. Specializing in
            <span className="text-cyan"> AI-driven security automation</span>, SOC engineering,
            and threat detection — where machine intelligence meets operational security.
          </motion.p>

          {/* Role tags */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {['SOC Analyst', 'Security Engineer', 'AI Security Engineer', 'Pen Tester'].map(r => (
              <span key={r} className="font-mono text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 border border-[rgba(129,140,248,0.25)] text-purple2 bg-[rgba(129,140,248,0.05)]">
                {r}
              </span>
            ))}
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <a href="#projects" className="btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-7 py-3 hover:bg-neon">
              View Projects
            </a>
            <a href="/resume/Joseph_Allan_Kamara_Resume.pdf" target="_blank" className="btn-hex border border-cyan text-cyan font-mono text-[11px] tracking-[2px] uppercase px-7 py-3 hover:bg-[rgba(0,212,255,0.08)]">
              Download Resume
            </a>
            <a href="https://linkedin.com/in/joseph-allan-kamara" target="_blank" className="btn-hex border border-[rgba(0,212,255,0.3)] text-muted font-mono text-[11px] tracking-[2px] uppercase px-7 py-3 hover:border-cyan hover:text-cyan">
              LinkedIn
            </a>
          </motion.div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-4 border border-[rgba(0,212,255,0.12)] max-w-lg"
          >
            {[
              { num: '4', label: 'Certifications' },
              { num: '5+', label: 'Projects' },
              { num: 'AI+', label: 'SOC Build' },
              { num: 'BS', label: 'Cybersecurity' },
            ].map((s, i) => (
              <div key={i} className={`px-4 py-4 ${i < 3 ? 'border-r border-[rgba(0,212,255,0.12)]' : ''}`}>
                <div className="font-mono text-2xl text-cyan leading-none mb-1">{s.num}</div>
                <div className="font-mono text-[9px] text-muted uppercase tracking-[1px]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Terminal + Profile */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-8"
        >
          {/* PROFILE PHOTO — FIXED */}
          <div className="profile-frame">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[rgba(0,212,255,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile/joseph.jpg"
                alt="Joseph Allan Kamara"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* TERMINAL BOX */}
          <div className="terminal-box w-full max-w-md rounded-sm">
            <div className="terminal-bar">
              <div className="terminal-dot bg-red-500" />
              <div className="terminal-dot bg-yellow-400" />
              <div className="terminal-dot bg-green-400" />
              <span className="font-mono text-[10px] text-muted ml-2 tracking-wider">jak@soc-terminal ~ %</span>
            </div>
            <div className="p-5 font-mono text-[12px] leading-7">
              <div><span className="text-neon">❯</span> <span className="text-cyan">whoami</span></div>
              <div className="text-muted pl-4">Joseph Allan Kamara</div>
              <div className="mt-2"><span className="text-neon">❯</span> <span className="text-cyan">cat certs.txt</span></div>
              <div className="text-muted pl-4">CompTIA Security+ ✓</div>
              <div className="text-muted pl-4">Cisco CCNA ✓</div>
              <div className="text-muted pl-4">TCM PSAA ✓</div>
              <div className="text-yellow-400 pl-4">CompTIA PenTest+ [IN PROGRESS]</div>
              <div className="mt-2"><span className="text-neon">❯</span> <span className="text-cyan">./status.sh</span></div>
              <div className="text-green-400 pl-4">OPEN TO WORK <span className="blink">_</span></div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
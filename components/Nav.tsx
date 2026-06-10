'use client'
// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const links = [
  { label: 'Projects',   href: '#projects' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Certs',      href: '#certs' },
  { label: 'Experience', href: '#experience' },
  { label: 'About',      href: '#about' },
  { label: 'Contact',    href: '#contact' },
]

const waveColors = ['#00f5d4', '#00d4ff', '#818cf8', '#a855f7', '#ef4444', '#f59e0b', '#00f5d4']

/* ════════════════════════════════════════
   Micro-LED edge strip with bloom + scan
═════════════════════════════════════════ */
function LedEdge({ position = 'top', colors = ['#00d4ff', '#00f5d4', '#818cf8'], width = 85, speed = 6, blur = 4, intensity = 1 }) {
  const isTop = position === 'top'
  const inset = `${(100 - width) / 2}%`
  const bloomColor = colors[0]
  return (
    <>
      {/* Soft bloom — gives it the "lit from within" feel */}
      <div style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: -3,
        left: inset, right: inset,
        height: 6,
        background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 25%, ${colors[1]} 50%, ${colors[2]} 75%, transparent 100%)`,
        filter: `blur(${blur}px)`,
        opacity: 0.6 * intensity,
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      {/* The LED strip itself — scrolling gradient */}
      <motion.div
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          [isTop ? 'top' : 'bottom']: 0,
          left: inset, right: inset,
          height: 1.3,
          background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}, ${colors[1]}, transparent)`,
          backgroundSize: '200% 100%',
          boxShadow: `0 0 6px ${bloomColor}, 0 0 14px ${bloomColor}66`,
          pointerEvents: 'none',
          borderRadius: 1,
          zIndex: 2,
        }}
      />
    </>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered]   = useState(null)
  const [time, setTime]         = useState('')
  const [labPulse, setLabPulse] = useState(false)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => { setLabPulse(true); setTimeout(() => setLabPulse(false), 1500) }, 10000)
    const initial = setTimeout(() => { setLabPulse(true); setTimeout(() => setLabPulse(false), 1500) }, 4000)
    return () => { clearInterval(interval); clearTimeout(initial) }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['projects', 'skills', 'certs', 'experience', 'about', 'contact']
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s)
        if (el && window.scrollY >= el.offsetTop - 150) { setActive(s); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled
            ? 'linear-gradient(180deg, rgba(2,8,24,0.78) 0%, rgba(2,8,24,0.55) 100%)'
            : 'linear-gradient(180deg, rgba(2,8,24,0.55) 0%, rgba(2,8,24,0.20) 100%)',
          backdropFilter: 'blur(22px) saturate(180%)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(0,212,255,0.10)' : '1px solid rgba(0,212,255,0.04)',
          transition: 'background 0.5s ease, border-color 0.5s ease',
        }}
      >
        {/* Top bevel highlight on the whole nav */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          pointerEvents: 'none',
        }} />
        {/* Bottom LED line that intensifies on scroll */}
        <LedEdge position="bottom" colors={['#00d4ff', '#00f5d4', '#818cf8']} width={92} speed={9} blur={3} intensity={scrolled ? 1 : 0.55} />

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 relative z-10">

          {/* ───────── LOGO ───────── */}
          <Link href="#" className="flex items-center gap-3 group shrink-0">
            <div style={{ perspective: 600 }}>
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  position: 'relative',
                  width: 38, height: 38,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,212,255,0.06) 50%, rgba(0,0,0,0.3) 100%)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  border: '1.2px solid rgba(0,212,255,0.4)',
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px rgba(0,0,0,0.4), 0 0 14px rgba(0,212,255,0.2)',
                  transformStyle: 'preserve-3d',
                  overflow: 'hidden',
                }}
              >
                <LedEdge position="top" colors={['#00d4ff', '#00f5d4', '#00d4ff']} width={75} speed={4} blur={2} />
                <span className="font-orbitron font-black" style={{ fontSize: 10.5, color: '#00d4ff', letterSpacing: 0.5, position: 'relative', zIndex: 3 }}>JAK</span>
                <span style={{
                  position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%',
                  background: '#00f5d4', boxShadow: '0 0 10px #00f5d4, 0 0 20px rgba(0,245,212,0.5)',
                  animation: 'navPulse 2s ease-in-out infinite', zIndex: 4,
                }} />
              </motion.div>
            </div>
            <div className="hidden sm:block">
              <div className="font-mono text-[11px] text-[#e2eaff] tracking-[2px] leading-tight">JOSEPH KAMARA</div>
              <div className="font-mono text-[8px] text-muted tracking-[2px] uppercase leading-tight">Cybersecurity Engineer</div>
            </div>
          </Link>

          {/* ───────── DESKTOP LINKS ───────── */}
          <ul className="hidden lg:flex items-center gap-1">
            {links.map(link => {
              const id = link.href.replace('#', '')
              const isActive  = active === id
              const isHovered = hovered === id
              return (
                <li key={link.href}>
                  <motion.a
                    href={link.href}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    className="relative block px-4 py-2 font-mono"
                    style={{
                      fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700,
                      color: isActive ? '#00d4ff' : (isHovered ? '#e2eaff' : '#8899bb'),
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(0,212,255,0.02))'
                        : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                      backdropFilter: (isActive || isHovered) ? 'blur(12px)' : 'none',
                      WebkitBackdropFilter: (isActive || isHovered) ? 'blur(12px)' : 'none',
                      border: `1px solid ${isActive ? 'rgba(0,212,255,0.4)' : isHovered ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                      borderRadius: 8,
                      boxShadow: isActive
                        ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 18px rgba(0,212,255,0.18)'
                        : 'none',
                      transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.2s',
                    }}
                  >
                    {isActive && <LedEdge position="top" colors={['#00d4ff', '#00f5d4', '#00d4ff']} width={70} speed={4} blur={2.5} />}
                    <span className="relative z-10" style={{ letterSpacing: 2 }}>{link.label}</span>
                    <span style={{
                      position: 'absolute', top: 4, right: 6, width: 4, height: 4, borderRadius: '50%',
                      background: '#00f5d4', boxShadow: '0 0 6px #00f5d4',
                      opacity: isActive ? 1 : 0, transition: 'opacity 0.3s',
                    }} />
                  </motion.a>
                </li>
              )
            })}

            {/* INCIDENT LAB — floating glass with rainbow LED */}
            <li style={{ perspective: 800, marginLeft: 6 }}>
              <motion.div
                whileHover={{ rotateY: 0, scale: 1.08, y: -4 }}
                animate={{ rotateY: (labPulse || hovered === 'lab') ? 0 : -3, rotateX: 2 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative' }}
              >
                <Link
                  href="/incident-replay"
                  onMouseEnter={() => setHovered('lab')}
                  onMouseLeave={() => setHovered(null)}
                  className="relative font-mono font-black overflow-hidden flex items-center gap-2"
                  style={{
                    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                    padding: '9px 16px', color: '#fff',
                    background: 'linear-gradient(135deg, rgba(0,245,212,0.14) 0%, rgba(168,85,247,0.06) 100%)',
                    backdropFilter: 'blur(18px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(200%)',
                    border: `1.3px solid ${labPulse || hovered === 'lab' ? 'rgba(0,245,212,0.7)' : 'rgba(0,245,212,0.35)'}`,
                    borderRadius: 9,
                    boxShadow: labPulse
                      ? 'inset 0 1.5px 0 rgba(255,255,255,0.45), 0 10px 26px rgba(0,0,0,0.5), 0 0 26px rgba(0,245,212,0.55)'
                      : 'inset 0 1.5px 0 rgba(255,255,255,0.32), 0 8px 22px rgba(0,0,0,0.4), 0 0 14px rgba(0,245,212,0.25)',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {/* Top white bevel */}
                  <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', pointerEvents: 'none' }} />
                  {/* Rainbow LED ribbon at bottom */}
                  <motion.div
                    style={{
                      position: 'absolute', bottom: 0, left: 10, right: 10, height: 2.2, borderRadius: 2,
                      background: 'linear-gradient(90deg, #00f5d4, #00d4ff, #818cf8, #a855f7, #ef4444, #f59e0b, #00f5d4, #00d4ff, #818cf8, #a855f7)',
                      backgroundSize: '200% 100%',
                      boxShadow: '0 0 8px rgba(168,85,247,0.6), 0 0 14px rgba(0,212,255,0.4)',
                    }}
                    animate={{ backgroundPositionX: ['0%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.span
                    style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0 }}
                    animate={{ backgroundColor: waveColors, boxShadow: waveColors.map(c => `0 0 8px ${c}`) }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="font-bold relative z-10"
                    animate={{ color: waveColors }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Incident Lab
                  </motion.span>
                </Link>
              </motion.div>
            </li>
          </ul>

          {/* ───────── RIGHT SIDE ───────── */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">

            {/* Clock — glass pill */}
            <div className="relative font-mono overflow-hidden" style={{
              fontSize: 10, padding: '6px 12px', letterSpacing: 1, color: 'rgba(255,255,255,0.7)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01))',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 14px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <LedEdge position="top" colors={['#00d4ff', '#00d4ff', '#00d4ff']} width={70} speed={8} blur={2} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 8px #00f5d4', animation: 'navPulse 2s ease-in-out infinite' }} />
              {time}
            </div>

            {/* Open to Work — glass pill */}
            <div className="relative font-mono font-black overflow-hidden" style={{
              fontSize: 9, padding: '6px 12px', letterSpacing: 1.5, textTransform: 'uppercase', color: '#00f5d4',
              background: 'linear-gradient(135deg, rgba(0,245,212,0.14), rgba(0,245,212,0.02))',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(0,245,212,0.4)', borderRadius: 8,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 14px rgba(0,245,212,0.22)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <LedEdge position="top" colors={['#00f5d4', '#00f5d4', '#00f5d4']} width={70} speed={7} blur={2} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 9px #00f5d4', animation: 'navPulse 2s ease-in-out infinite' }} />
              Open to Work
            </div>

            {/* HIRE ME — flagship floating glass with dual LED edges */}
            <div style={{ perspective: 900 }}>
              <motion.a
                href="mailto:kamarajosephallan@gmail.com"
                whileHover={{ rotateY: 0, rotateX: 0, scale: 1.1, y: -4 }}
                animate={{ rotateY: -4, rotateX: 3 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative font-mono font-black overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase',
                  padding: '11px 22px', color: '#fff',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.32) 0%, rgba(0,245,212,0.16) 50%, rgba(168,85,247,0.10) 100%)',
                  backdropFilter: 'blur(20px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                  border: '1.5px solid rgba(0,245,212,0.6)',
                  borderRadius: 11,
                  boxShadow:
                    'inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.05), ' +
                    '0 14px 30px rgba(0,0,0,0.5), 0 0 32px rgba(0,212,255,0.45)',
                }}
              >
                <LedEdge position="top"    colors={['#00d4ff', '#fff', '#00f5d4']}    width={80} speed={3} blur={3} />
                <LedEdge position="bottom" colors={['#818cf8', '#a855f7', '#00d4ff']} width={80} speed={4} blur={3} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 10px #00f5d4, 0 0 18px rgba(0,245,212,0.6)', animation: 'navPulse 1.5s ease-in-out infinite' }} />
                <span className="relative z-10">Hire Me</span>
              </motion.a>
            </div>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-[5px] p-2 z-[60] relative"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px]" style={{ background: menuOpen ? '#00f5d4' : '#00d4ff' }} />
            <motion.span animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="block w-4 h-[1.5px] bg-cyan" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-6 h-[1.5px]" style={{ background: menuOpen ? '#00f5d4' : '#00d4ff' }} />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 28px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 40px) 28px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 28px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center lg:hidden"
            style={{ background: 'linear-gradient(180deg, rgba(2,8,24,0.96), rgba(5,14,30,0.98))', backdropFilter: 'blur(24px)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative z-10 flex flex-col items-center gap-2 w-full px-8 max-w-sm">
              <div className="font-mono text-[9px] text-muted tracking-[5px] uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-[rgba(0,212,255,0.3)]" /> Navigation <span className="w-8 h-px bg-[rgba(0,212,255,0.3)]" />
              </div>

              {links.map((link, i) => (
                <motion.a
                  key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ x: 8 }}
                  className="relative w-full overflow-hidden flex items-center justify-between group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10,
                    padding: '14px 20px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 18px rgba(0,0,0,0.35)',
                  }}
                >
                  <LedEdge position="top" colors={['#00d4ff', '#00f5d4', '#00d4ff']} width={80} speed={6} blur={2.5} />
                  <span className="font-orbitron text-lg font-bold text-[#e2eaff] uppercase tracking-wide group-hover:text-cyan transition-colors">{link.label}</span>
                  <span className="font-mono text-[10px] text-muted group-hover:text-neon transition-colors">→</span>
                </motion.a>
              ))}

              {/* Incident Lab in mobile menu */}
              <motion.div
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.07, duration: 0.4 }}
                className="w-full"
              >
                <Link href="/incident-replay" onClick={() => setMenuOpen(false)}
                  className="relative w-full overflow-hidden flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,245,212,0.14), rgba(168,85,247,0.06))',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(0,245,212,0.4)', borderRadius: 10,
                    padding: '14px 20px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 22px rgba(0,245,212,0.18)',
                  }}
                >
                  <motion.div
                    style={{ position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, borderRadius: 2,
                      background: 'linear-gradient(90deg, #00f5d4, #00d4ff, #818cf8, #a855f7, #ef4444, #f59e0b, #00f5d4, #00d4ff)',
                      backgroundSize: '200% 100%', boxShadow: '0 0 8px rgba(168,85,247,0.5)' }}
                    animate={{ backgroundPositionX: ['0%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                    <span className="font-orbitron text-lg font-bold text-neon uppercase tracking-wide">Incident Lab</span>
                  </div>
                  <span className="font-mono text-[10px] text-neon">→</span>
                </Link>
              </motion.div>

              {/* Hire Me in mobile menu */}
              <motion.a
                href="mailto:kamarajosephallan@gmail.com" onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.04 }}
                className="relative mt-6 w-full overflow-hidden text-center font-mono font-black"
                style={{
                  padding: '16px 20px', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#fff',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.32), rgba(0,245,212,0.16), rgba(168,85,247,0.10))',
                  backdropFilter: 'blur(18px) saturate(200%)', WebkitBackdropFilter: 'blur(18px) saturate(200%)',
                  border: '1.4px solid rgba(0,245,212,0.6)', borderRadius: 11,
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.5), 0 14px 30px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,255,0.45)',
                }}
              >
                <LedEdge position="top"    colors={['#00d4ff', '#fff', '#00f5d4']}    width={85} speed={3} blur={3} />
                <LedEdge position="bottom" colors={['#818cf8', '#a855f7', '#00d4ff']} width={85} speed={4} blur={3} />
                <span className="relative z-10">Hire Me</span>
              </motion.a>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                className="flex gap-8 mt-6"
              >
                {[
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara' },
                  { label: 'GitHub',   href: 'https://github.com/kamara1994' },
                  { label: 'Email',    href: 'mailto:kamarajosephallan@gmail.com' },
                ].map(l => (
                  <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors">
                    {l.label}
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes navPulse { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }
      `}</style>
    </>
  )
}

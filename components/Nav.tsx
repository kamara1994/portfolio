'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const links = [
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Certs', href: '#certs' },
  { label: 'Experience', href: '#experience' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [labPulse, setLabPulse] = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Pulse the LAB button periodically to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setLabPulse(true)
      setTimeout(() => setLabPulse(false), 1500)
    }, 10000)
    const initial = setTimeout(() => {
      setLabPulse(true)
      setTimeout(() => setLabPulse(false), 1500)
    }, 4000)
    return () => { clearInterval(interval); clearTimeout(initial) }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['projects', 'skills', 'certs', 'experience', 'about', 'contact']
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s)
        if (el && window.scrollY >= el.offsetTop - 150) {
          setActive(s)
          break
        }
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-blur border-b border-[rgba(0,212,255,0.1)]' : ''}`}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-60" />

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LOGO */}
          <a href="#" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="w-8 h-8 border border-[rgba(0,212,255,0.4)] flex items-center justify-center group-hover:border-cyan transition-colors">
                <span className="font-orbitron text-[10px] font-black text-cyan">JAK</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon rounded-full animate-pulse-slow" />
            </div>
            <div className="hidden sm:block">
              <div className="font-mono text-[11px] text-[#e2eaff] tracking-[2px]">JOSEPH KAMARA</div>
              <div className="font-mono text-[8px] text-muted tracking-[2px] uppercase">Cybersecurity Engineer</div>
            </div>
          </a>

          {/* DESKTOP LINKS */}
          <ul className="hidden lg:flex items-center gap-1">
            {links.map(link => {
              const id = link.href.replace('#', '')
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative px-4 py-2 block font-mono text-[11px] tracking-[1.5px] uppercase transition-all duration-200"
                    style={{ color: active === id ? '#00d4ff' : hovered === id ? '#e2eaff' : '#8899bb' }}
                  >
                    {active === id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.05)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span
                      className="absolute top-1 right-1 w-1 h-1 rounded-full bg-neon transition-opacity duration-200"
                      style={{ opacity: active === id ? 1 : 0 }}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </a>
                </li>
              )
            })}

            {/* INCIDENT REPLAY LAB — glowing nav link */}
            <li>
              <Link
                href="/incident-replay"
                onMouseEnter={() => setHovered('lab')}
                onMouseLeave={() => setHovered(null)}
                className="relative px-3 py-2 flex items-center gap-2 font-mono text-[10px] tracking-[1.5px] uppercase transition-all duration-200 border ml-2"
                style={{
                  borderColor: labPulse || hovered === 'lab' ? 'rgba(0,245,212,0.6)' : 'rgba(0,245,212,0.25)',
                  color: hovered === 'lab' ? '#00f5d4' : '#00c4a8',
                  background: labPulse || hovered === 'lab' ? 'rgba(0,245,212,0.08)' : 'rgba(0,245,212,0.03)',
                  boxShadow: labPulse ? '0 0 20px rgba(0,245,212,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-neon shrink-0"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Incident Lab
              </Link>
            </li>
          </ul>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="font-mono text-[10px] text-muted tracking-wider border border-[rgba(0,212,255,0.1)] px-3 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
              {time}
            </div>
            <div className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border border-[rgba(0,245,212,0.3)] text-neon bg-[rgba(0,245,212,0.06)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
              Open to Work
            </div>
            <a
              href="mailto:kamarajosephallan@gmail.com"
              className="font-mono text-[11px] tracking-[2px] uppercase px-5 py-2 bg-cyan text-bg hover:bg-neon transition-colors"
              style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
            >
              Hire Me
            </a>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-[5px] p-2 z-[60] relative"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-[1.5px]"
              style={{ background: menuOpen ? '#00f5d4' : '#00d4ff' }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-4 h-[1.5px] bg-cyan"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-[1.5px]"
              style={{ background: menuOpen ? '#00f5d4' : '#00d4ff' }}
            />
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
            className="fixed inset-0 z-40 bg-[#020818] flex flex-col items-center justify-center lg:hidden"
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative z-10 flex flex-col items-center gap-2 w-full px-8 max-w-sm">
              <div className="font-mono text-[9px] text-muted tracking-[5px] uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-[rgba(0,212,255,0.3)]" />
                Navigation
                <span className="w-8 h-px bg-[rgba(0,212,255,0.3)]" />
              </div>

              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="w-full border border-[rgba(0,212,255,0.1)] px-6 py-4 flex items-center justify-between group hover:border-[rgba(0,212,255,0.4)] hover:bg-[rgba(0,212,255,0.03)] transition-all"
                >
                  <span className="font-orbitron text-lg font-bold text-[#e2eaff] uppercase tracking-wide group-hover:text-cyan transition-colors">
                    {link.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted group-hover:text-neon transition-colors">→</span>
                </motion.a>
              ))}

              {/* Incident Replay Lab in mobile menu */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.07, duration: 0.4 }}
                className="w-full"
              >
                <Link
                  href="/incident-replay"
                  onClick={() => setMenuOpen(false)}
                  className="w-full border px-6 py-4 flex items-center justify-between group transition-all"
                  style={{ borderColor: 'rgba(0,245,212,0.3)', background: 'rgba(0,245,212,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                    <span className="font-orbitron text-lg font-bold text-neon uppercase tracking-wide">
                      Incident Lab
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neon">→</span>
                </Link>
              </motion.div>

              <motion.a
                href="mailto:kamarajosephallan@gmail.com"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-6 w-full text-center font-mono text-[12px] tracking-[3px] uppercase px-10 py-4 bg-cyan text-bg hover:bg-neon transition-colors"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
              >
                Hire Me
              </motion.a>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex gap-8 mt-6"
              >
                {[
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara' },
                  { label: 'GitHub', href: 'https://github.com/kamara1994' },
                  { label: 'Email', href: 'mailto:kamarajosephallan@gmail.com' },
                ].map(l => (
                  <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

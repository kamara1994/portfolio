'use client'
// @ts-nocheck
// =============================================================================
// HERO — cinematic, photo-forward. Monumental nameplate on the left, and the
// 3D orbiting-cert portrait (CertOrbit) as the centerpiece on the right, the
// way Joseph likes it. Smooth staggered entrance, vibrant neon energy.
// =============================================================================
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'

// 3D orbit is client + WebGL only — never server-render it.
const CertOrbit = dynamic(() => import('@/components/CertOrbit'), { ssr: false })

const ROLES = [
  'SOC Automation Engineer',
  'Cloud Security Engineer',
  'AI Security Engineer',
  'Incident Responder',
  'Penetration Tester',
]

function useTyping(words, reduced) {
  const [txt, setTxt] = useState(reduced ? words[0] : '')
  const [i, setI] = useState(0)
  const [del, setDel] = useState(false)
  useEffect(() => {
    if (reduced) return
    const target = words[i]
    let t
    if (!del && txt.length < target.length) t = setTimeout(() => setTxt(target.slice(0, txt.length + 1)), 70)
    else if (!del && txt.length === target.length) t = setTimeout(() => setDel(true), 1900)
    else if (del && txt.length > 0) t = setTimeout(() => setTxt(txt.slice(0, -1)), 35)
    else { setDel(false); setI((i + 1) % words.length) }
    return () => clearTimeout(t)
  }, [txt, del, i, reduced, words])
  return txt
}

export default function Hero() {
  const reduced = useReducedMotion()
  const role = useTyping(ROLES, !!reduced)

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0" style={{
        background:
          'radial-gradient(760px 620px at 78% 42%, rgba(0,212,255,0.12), transparent 60%),' +
          'radial-gradient(680px 520px at 12% 18%, rgba(129,140,248,0.12), transparent 58%),' +
          'radial-gradient(600px 480px at 88% 90%, rgba(0,245,212,0.08), transparent 55%)',
      }} />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" style={{
        maskImage: 'radial-gradient(ellipse at 55% 42%, black 20%, transparent 76%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 55% 42%, black 20%, transparent 76%)',
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
        {/* LEFT — name + pitch */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3 font-mono text-[11px] text-neon tracking-[3px] uppercase mb-6"
          >
            <span className="w-8 h-px bg-neon" />
            Available for Roles · Open to Work
            <span className="w-2 h-2 rounded-full bg-neon" style={{ boxShadow: '0 0 8px var(--neon)', animation: reduced ? 'none' : 'heroPulse 2s ease-in-out infinite' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}
            className="font-orbitron font-black leading-[0.95] tracking-tight mb-4"
            style={{ fontSize: 'clamp(42px, 6.4vw, 84px)' }}
          >
            <span className="block text-[#e2eaff]">Joseph</span>
            <span className="block text-[#e2eaff]">Allan</span>
            <span className="block holo-text">Kamara</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="font-mono text-lg text-cyan2 mb-6 h-7 flex items-center gap-1"
          >
            {role}<span className="blink text-neon">_</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }}
            className="text-muted text-[15px] leading-relaxed max-w-xl mb-8"
          >
            From <span className="text-[#ffaa00] font-semibold">Sierra Leone</span> to the global stage — I design and build
            security automation connecting <span className="text-cyan font-semibold">SIEM detection</span>,{' '}
            <span className="text-neon font-semibold">cloud defense</span>, and{' '}
            <span className="text-purple2 font-semibold">AI-assisted triage</span> into structured,
            analyst-reviewed response workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.36 }}
            className="flex flex-wrap gap-3.5"
          >
            <a href="#projects" className="hero-cta hero-cta-primary">View Projects →</a>
            <a href="#briefing" className="hero-cta hero-cta-ghost">Recruiter Briefing</a>
            <a href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf" target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta-ghost">↓ Résumé</a>
          </motion.div>
        </div>

        {/* RIGHT — 3D orbiting-cert portrait (the way it was) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 lg:order-2 flex items-center justify-center"
        >
          <CertOrbit />
        </motion.div>
      </div>
    </section>
  )
}

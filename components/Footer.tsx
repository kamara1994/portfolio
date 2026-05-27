'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const quickLinks = [
  { label: 'Incident Lab', href: '/incident-replay', highlight: true },
  { label: 'BLUE SOC', href: '/#projects' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Certs', href: '/#certs' },
  { label: 'Contact', href: '/#contact' },
]

const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara', color: '#0077b5' },
  { label: 'GitHub', href: 'https://github.com/kamara1994', color: '#00f5d4' },
  { label: 'Email', href: 'mailto:kamarajosephallan@gmail.com', color: '#00d4ff' },
]

export default function Footer() {
  const [copied, setCopied] = useState(false)

  const shareOnLinkedIn = () => {
    const text = encodeURIComponent(
      `Check out this cybersecurity portfolio by Joseph Allan Kamara — Security+ · PenTest+ · CCNA · PSAA certified. Built BLUE SOC, FORTRESS v2, and an interactive Incident Replay Lab. Available for SOC Analyst and Security Engineer roles. josephkamara.vercel.app`
    )
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://josephkamara.vercel.app')}&summary=${text}`, '_blank')
  }

  const copyLink = () => {
    navigator.clipboard.writeText('https://josephkamara.vercel.app')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer className="relative z-10 border-t border-[rgba(0,212,255,0.1)] px-6 pt-12 pb-6"
      style={{ background: 'rgba(2,8,24,0.8)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-[rgba(0,212,255,0.4)] flex items-center justify-center">
                <span className="font-orbitron text-[10px] font-black text-cyan">JAK</span>
              </div>
              <div>
                <div className="font-mono text-[12px] text-[#e2eaff] tracking-[2px]">JOSEPH KAMARA</div>
                <div className="font-mono text-[9px] text-muted tracking-[1px] uppercase">Cybersecurity Engineer</div>
              </div>
            </div>
            <p className="font-mono text-[11px] text-muted leading-relaxed mb-4">
              Building AI-assisted security systems from Sierra Leone to Philadelphia.
              Available for SOC Analyst, Security Engineer, and Cloud Security roles.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              <span className="font-mono text-[10px] text-neon">Available Now · Remote-First</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="font-mono text-[9px] text-muted tracking-[3px] uppercase mb-4">Quick Links</div>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-mono text-[11px] transition-colors flex items-center gap-1.5 ${
                    link.highlight ? 'text-neon hover:text-cyan' : 'text-muted hover:text-cyan'
                  }`}
                >
                  {link.highlight && <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Share + Social */}
          <div>
            <div className="font-mono text-[9px] text-muted tracking-[3px] uppercase mb-4">Connect & Share</div>

            {/* Social links */}
            <div className="space-y-2 mb-6">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  className="flex items-center justify-between font-mono text-[11px] px-3 py-2 border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.25)] transition-all group"
                >
                  <span style={{ color: link.color }}>{link.label}</span>
                  <span className="text-muted group-hover:text-cyan transition-colors text-[10px]">↗</span>
                </a>
              ))}
            </div>

            {/* Share buttons */}
            <div className="flex gap-2">
              <motion.button
                onClick={shareOnLinkedIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-2 border border-[rgba(0,119,181,0.4)] text-[#0077b5] hover:bg-[rgba(0,119,181,0.08)] transition-colors"
              >
                Share on LinkedIn
              </motion.button>
              <motion.button
                onClick={copyLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-2 border border-[rgba(0,212,255,0.2)] text-cyan hover:bg-[rgba(0,212,255,0.06)] transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy Link'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.2)] to-transparent mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[10px] text-muted">
            © 2026 Joseph Allan Kamara — Built with Next.js, Tailwind, Framer Motion
          </div>
          <div className="flex items-center gap-4">
            <Link href="/incident-replay"
              className="font-mono text-[9px] text-neon hover:text-cyan transition-colors flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-neon" />
              Incident Replay Lab
            </Link>
            <a href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf" target="_blank"
              className="font-mono text-[9px] text-muted hover:text-cyan transition-colors">
              ↓ Resume
            </a>
            <span className="font-mono text-[9px] text-[rgba(0,212,255,0.3)]">
              Security+ · PenTest+ · CCNA · PSAA
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

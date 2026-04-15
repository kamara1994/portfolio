'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const contactLinks = [
  { label: 'Email Me', href: 'mailto:kamarajosephallan@gmail.com', style: 'primary' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara', style: 'outline' },
  { label: 'GitHub', href: 'https://github.com/joseph-allan-kamara', style: 'outline' },
]

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 py-28 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-3xl mx-auto text-center">
        <SectionHeader label="Get In Touch" title="Let's " accent="Connect" center />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[15px] text-muted leading-relaxed mb-12 max-w-xl mx-auto"
        >
          I'm actively seeking internship and full-time roles in cybersecurity and AI security engineering.
          Whether you're a recruiter, hiring manager, or fellow builder — let's talk.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {contactLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              className={`btn-hex font-mono text-[11px] tracking-[2px] uppercase px-8 py-3 transition-all ${
                link.style === 'primary'
                  ? 'bg-cyan text-bg hover:bg-neon'
                  : 'border border-[rgba(0,212,255,0.3)] text-cyan hover:bg-[rgba(0,212,255,0.07)] hover:border-cyan'
              }`}
            >
              {link.label}
            </a>
          ))}
        </motion.div>

        {/* EMAIL DISPLAY */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="terminal-box inline-block mx-auto"
        >
          <div className="terminal-bar">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-400" />
            <div className="terminal-dot bg-green-400" />
          </div>
          <div className="px-8 py-4 font-mono text-[13px]">
            <span className="text-neon">❯ </span>
            <span className="text-cyan">echo</span>
            <span className="text-muted"> $CONTACT_EMAIL</span>
            <br />
            <span className="text-[#e2eaff] pl-4">kamarajosephallan@gmail.com</span>
            <span className="blink text-neon"> _</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

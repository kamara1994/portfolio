'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const roles = [
  'SOC Analyst', 'Security Engineer', 'Cloud Security Engineer',
  'AI Security Engineer', 'Penetration Tester', 'Other',
]

const quickLinks = [
  { label: 'Email Direct', href: 'mailto:kamarajosephallan@gmail.com', color: '#00d4ff', icon: '✉️' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/joseph-allan-kamara', color: '#0077b5', icon: '💼' },
  { label: 'GitHub', href: 'https://github.com/kamara1994', color: '#00f5d4', icon: '🐙' },
  { label: 'Download Resume', href: '/resume/Joseph_Allan_Kamara_Resume_v3.pdf', color: '#818cf8', icon: '📄' },
]

export default function Contact() {
  const [step, setStep] = useState<'idle' | 'form' | 'sending' | 'done'>('idle')
  const [selectedRole, setSelectedRole] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [aiMessage, setAiMessage] = useState('')

  const generateOutreach = async () => {
    if (!selectedRole || !name) return
    setStep('sending')

    // Generate personalized message using PWEZA
    try {
      const prompt = `${name} from ${company || 'a company'} is looking to hire for a ${selectedRole} role. 
      Write a SHORT 2-sentence personalized response from Joseph's AI assistant PWEZA that:
      1. Acknowledges their specific role interest
      2. Highlights the most relevant Joseph project for that role
      Keep it under 40 words, warm and direct.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      setAiMessage(data.content || `Thanks for reaching out about the ${selectedRole} role. Joseph would love to connect — email him directly at kamarajosephallan@gmail.com.`)
    } catch {
      setAiMessage(`Thanks for your interest in Joseph for the ${selectedRole} role. He's available now and would love to connect. Email him at kamarajosephallan@gmail.com.`)
    }

    setStep('done')
  }

  return (
    <section id="contact" className="relative z-10 py-28 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="Get In Touch" title="Let's " accent="Connect" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT — Quick links + info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[15px] text-muted leading-relaxed mb-8">
              Available now for SOC Analyst, Security Engineer, and Cloud Security roles.
              Remote-first, based in Philadelphia PA. Response within 24 hours.
            </p>

            {/* Quick contact links */}
            <div className="space-y-3 mb-8">
              {quickLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  download={link.href.includes('.pdf') ? true : undefined}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-4 border border-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.3)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-mono text-[12px]" style={{ color: link.color }}>{link.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted group-hover:text-cyan transition-colors">→</span>
                </motion.a>
              ))}
            </div>

            {/* Terminal email display */}
            <div className="terminal-box">
              <div className="terminal-bar">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">contact.sh</span>
              </div>
              <div className="px-6 py-4 font-mono text-[12px]">
                <div><span className="text-neon">❯ </span><span className="text-cyan">echo</span><span className="text-muted"> $EMAIL</span></div>
                <div className="text-[#e2eaff] pl-4 mt-1">kamarajosephallan@gmail.com<span className="blink text-neon"> _</span></div>
                <div className="mt-2"><span className="text-neon">❯ </span><span className="text-cyan">echo</span><span className="text-muted"> $AVAILABLE</span></div>
                <div className="text-neon pl-4 mt-1">Immediately · Remote-First · Philadelphia PA</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Smart intake form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="border border-[rgba(0,212,255,0.15)] relative overflow-hidden">
              {/* Corner accents */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan opacity-60" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan opacity-60" />

              <div className="p-6">
                <div className="font-mono text-[9px] text-neon tracking-[3px] uppercase mb-1">
                  INTAKE BRIEFING
                </div>
                <div className="font-mono text-[11px] text-muted mb-6">
                  Tell PWEZA what you're looking for and get a personalized response
                </div>

                <AnimatePresence mode="wait">

                  {/* IDLE state */}
                  {step === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <button
                        onClick={() => setStep('form')}
                        className="w-full font-mono text-[11px] tracking-[2px] uppercase px-6 py-4 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-cyan hover:bg-[rgba(0,212,255,0.15)] hover:border-cyan transition-all flex items-center justify-center gap-3"
                      >
                        <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                        Initiate Contact Briefing
                      </button>
                      <p className="font-mono text-[9px] text-muted text-center mt-3">
                        Or email directly: kamarajosephallan@gmail.com
                      </p>
                    </motion.div>
                  )}

                  {/* FORM state */}
                  {step === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="space-y-4">

                      <div>
                        <label className="font-mono text-[9px] text-muted tracking-[2px] uppercase block mb-2">Your Name</label>
                        <input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="First name"
                          className="w-full bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] px-4 py-2.5 font-mono text-[12px] text-[#e2eaff] placeholder-[#334155] outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[9px] text-muted tracking-[2px] uppercase block mb-2">Company (optional)</label>
                        <input
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="Company name"
                          className="w-full bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] px-4 py-2.5 font-mono text-[12px] text-[#e2eaff] placeholder-[#334155] outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[9px] text-muted tracking-[2px] uppercase block mb-2">Role You're Hiring For</label>
                        <div className="flex flex-wrap gap-2">
                          {roles.map(role => (
                            <button
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className="font-mono text-[9px] px-3 py-1.5 border transition-all"
                              style={{
                                borderColor: selectedRole === role ? 'rgba(0,212,255,0.6)' : 'rgba(0,212,255,0.15)',
                                color: selectedRole === role ? '#00d4ff' : '#8899bb',
                                background: selectedRole === role ? 'rgba(0,212,255,0.08)' : 'transparent',
                              }}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-mono text-[9px] text-muted tracking-[2px] uppercase block mb-2">Message (optional)</label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="What are you looking for?"
                          rows={3}
                          className="w-full bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] px-4 py-2.5 font-mono text-[12px] text-[#e2eaff] placeholder-[#334155] outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors resize-none"
                        />
                      </div>

                      <button
                        onClick={generateOutreach}
                        disabled={!name || !selectedRole}
                        className="w-full font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Generate Personalized Response →
                      </button>
                    </motion.div>
                  )}

                  {/* SENDING state */}
                  {step === 'sending' && (
                    <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center gap-4">
                      <motion.div
                        className="w-10 h-10 border-2 border-cyan rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="font-mono text-[11px] text-muted">PWEZA is generating your briefing...</div>
                    </motion.div>
                  )}

                  {/* DONE state */}
                  {step === 'done' && (
                    <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="space-y-4">
                      <div className="border border-[rgba(0,245,212,0.3)] bg-[rgba(0,245,212,0.04)] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                          <span className="font-mono text-[9px] text-neon tracking-[2px] uppercase">PWEZA Response</span>
                        </div>
                        <p className="font-mono text-[12px] text-[#b0c4d8] leading-relaxed">{aiMessage}</p>
                      </div>

                      <a
                        href={`mailto:kamarajosephallan@gmail.com?subject=Hiring Inquiry — ${selectedRole}&body=Hi Joseph, I'm ${name}${company ? ` from ${company}` : ''} and I'm interested in discussing a ${selectedRole} role.${message ? `\n\n${message}` : ''}`}
                        className="w-full block text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors"
                      >
                        Send Email to Joseph →
                      </a>

                      <button
                        onClick={() => { setStep('idle'); setName(''); setCompany(''); setSelectedRole(''); setMessage('') }}
                        className="w-full font-mono text-[10px] text-muted hover:text-cyan transition-colors"
                      >
                        Start over
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

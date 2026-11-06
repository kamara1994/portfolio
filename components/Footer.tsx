'use client'
import { useState } from 'react'
import { RESUME } from './Nav'

export const EMAIL = 'kamarajosephallan@gmail.com'
export const LINKEDIN = 'https://linkedin.com/in/joseph-allan-kamara'
export const GITHUB = 'https://github.com/kamara1994'

const ROLES = ['SOC Analyst', 'Security Engineer', 'Cloud Security', 'IT / Systems', 'Something else']

/** Closing block: "Let's connect" with a quick message that opens the visitor's own email app. */
export default function Footer() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [note, setNote] = useState('')

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = `${role} role${company ? ` at ${company}` : ''}`
    const body = [
      'Hi Joseph,',
      '',
      `I'm ${name || '[your name]'}${company ? ` from ${company}` : ''}. I'd like to talk with you about a ${role} role.`,
      ...(note ? ['', note] : []),
    ].join('\n')
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <footer id="contact" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(80% 60% at 15% 10%, rgba(80,120,210,0.16) 0%, transparent 65%)' }} />

      <div className="wrap relative py-24 md:py-32">
        <div className="hud-frame grid gap-14 p-6 sm:p-10 md:p-14 lg:grid-cols-12 lg:gap-12">
          <span aria-hidden className="hud-corner tl" /><span aria-hidden className="hud-corner tr" />
          <span aria-hidden className="hud-corner bl" /><span aria-hidden className="hud-corner br" />

          <div className="lg:col-span-6">
            <p className="text-[clamp(18px,1.4vw,22px)] font-medium text-signal">Hiring for security, cloud, or IT?</p>
            <h2 className="mt-3 font-display text-[clamp(52px,7vw,112px)] font-bold uppercase leading-[0.9]">
              Let&apos;s <span className="title-accent">connect</span>
            </h2>
            <p className="mt-7 max-w-[42ch] text-[18px] leading-relaxed text-snow/85">
              I graduate in December 2026 and I&apos;m available now for full-time roles. Based in Philadelphia, open to remote.
            </p>

            <ul className="mt-10 space-y-1">
              {[
                { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
                { label: 'LinkedIn', value: 'joseph-allan-kamara', href: LINKEDIN, ext: true },
                { label: 'GitHub', value: 'kamara1994', href: GITHUB, ext: true },
                { label: 'Résumé', value: 'Download PDF', href: RESUME, ext: true },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener' } : {})} className="connect-row">
                    <span className="w-24 shrink-0 text-[13px] font-semibold uppercase tracking-[0.18em] text-smoke">{l.label}</span>
                    <span className="text-[17px] text-snow/90">{l.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={send} className="lg:col-span-5 lg:col-start-8" aria-label="Quick message">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#6FD6FF]">Quick message</p>
            <p className="mt-2 text-[15px] text-smoke">Fill this in and it opens your email app with the message ready to send.</p>
            <div className="mt-8 grid gap-5">
              <label className="field">
                <span>Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </label>
              <label className="field">
                <span>Company</span>
                <input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </label>
              <label className="field">
                <span>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Message (optional)</span>
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <div className="pt-2">
                <button type="submit" className="btn-primary">Write the email</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-3 py-8 text-[14px] text-smoke md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Joseph Allan Kamara</p>
          <p>Built with Next.js, deployed on Vercel</p>
        </div>
      </div>
    </footer>
  )
}

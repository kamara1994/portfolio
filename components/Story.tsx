'use client'
import { useEffect, useRef } from 'react'
import LineReveal from './LineReveal'

type Milestone = {
  when: string
  tag: string
  title: string
  sub: string
  desc: string
  color: string
  icon: string
  now?: boolean
}

const MILESTONES: Milestone[] = [
  { when: 'Early years', tag: 'Origin', title: 'Freetown, Sierra Leone', sub: 'Where it started', color: '#F5A524', icon: '🌍',
    desc: 'Born and raised in Freetown. Fascinated by technology from an early age: taking computers apart and learning how networks work.' },
  { when: 'Sep 2023', tag: 'Education', title: 'BYU-Idaho', sub: 'B.S. Cybersecurity program', color: '#4CC9FF', icon: '🎓',
    desc: 'Started the Cybersecurity degree: networking, operating systems, cryptography, and security fundamentals.' },
  { when: 'Mar 2025', tag: 'Certification', title: 'CompTIA Security+', sub: 'First security certification', color: '#4BE3C8', icon: '🏅',
    desc: 'Validated core security skills: threat detection, risk management, cryptography, and network security.' },
  { when: 'Earned', tag: 'Certification', title: 'Cisco CCNA', sub: 'Enterprise networking', color: '#38BDF8', icon: '🌐',
    desc: 'Routing, switching, and segmentation. Built enterprise branch networks with OSPF, VRRP, EtherChannel, VLANs, and SSH hardening.' },
  { when: 'Mar 2026', tag: 'Certification', title: 'PenTest+ and TCM PSAA', sub: 'Offense and defense', color: '#F97316', icon: '🔓',
    desc: 'Penetration testing on one side; SOC operations, alert triage, and incident response on the other.' },
  { when: '2026', tag: 'Projects', title: 'BLUE SOC, FORTRESS, BLUE-X, PWEZA', sub: 'Security and AI systems built', color: '#7FA6FF', icon: '🛡️',
    desc: 'AI-assisted SOC automation, an AWS defense lab deployed with Terraform, a PyTorch threat classifier, and PWEZA, a voice-first portfolio agent.' },
  { when: 'Dec 2026', tag: 'Now', title: 'B.S. Cybersecurity', sub: 'Graduating from BYU-Idaho', color: '#4BE3C8', icon: '🚀', now: true,
    desc: 'Based in Philadelphia and available for SOC Analyst, Security Engineer, Cloud Security, and IT roles.' },
]

export default function Story() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('reveal-on')

    // Reveal the story lines and each milestone as it scrolls into view, and reset when it leaves, so it replays every time
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)),
      { rootMargin: '0px 0px -18% 0px', threshold: 0.15 },
    )
    el.querySelectorAll('.rv, .rv-lines, .jt-row').forEach((n) => io.observe(n))

    // Draw the beam down with the scroll
    const jt = el.querySelector<HTMLElement>('.jt')
    const rows = Array.from(el.querySelectorAll('.jt-row'))
    let raf = 0
    const draw = () => {
      raf = 0
      if (!jt) return
      const r = jt.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - r.top) / r.height))
      jt.style.setProperty('--fill', String(p))
      // Light the milestone the lantern is passing
      const ly = r.top + p * r.height
      let best: Element | null = null
      rows.forEach((row) => { if (row.getBoundingClientRect().top + 22 <= ly + 30) best = row })
      rows.forEach((row) => row.classList.toggle('is-lit', row === best && p > 0.01))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={root} id="story" className="wrap pb-16 pt-16 md:pb-24 md:pt-32">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="rv-lines">
              <LineReveal parts={[{ text: 'My story' }]} className="text-[clamp(18px,1.4vw,22px)] font-medium text-signal" />
              <LineReveal
                as="h2"
                startLine={1}
                parts={[{ text: 'Protecting systems means protecting' }, { text: 'people', className: 'title-accent' }, { text: '.', attach: true }]}
                className="mt-3 font-display text-[clamp(38px,3.8vw,64px)] font-bold uppercase leading-[0.95]"
              />
              <div className="mt-8 max-w-[52ch] space-y-5 text-[17px] leading-[1.75] text-snow/80">
                <LineReveal
                  startLine={5}
                  parts={[{ text: 'I grew up in Freetown, Sierra Leone, where I saw how much everyday life depends on infrastructure that works. That is what pulled me into security: not compliance checkboxes, but keeping real systems running for real people.' }]}
                />
                <LineReveal
                  startLine={10}
                  parts={[{ text: 'Today I am finishing my B.S. in Cybersecurity at BYU-Idaho and building the work to back it up. I use AI where it cuts analyst toil, and I keep a human approving every containment decision.' }]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
        <p className="rv font-display text-[clamp(28px,2.6vw,40px)] font-bold uppercase leading-none">
          The <span className="text-[#6FD6FF]">journey</span>
        </p>

        <div className="jt relative mt-10">
          <div aria-hidden className="jt-beam">
            <div className="jt-fill">
              {[0, 1.2, 2.5, 3.8].map((d, i) => (
                <span key={i} className={`jt-packet ${i % 2 ? 'alt' : ''}`} style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <span className="jt-lantern"><Lantern /></span>
          </div>

          <ol className="space-y-5">
            {MILESTONES.map((m) => (
              <li key={m.title} className="jt-row group" style={{ ['--c' as string]: m.color }}>
                <span className={`jt-node ${m.now ? 'is-now' : ''}`}>
                  <span aria-hidden className="jt-emoji">{m.icon}</span>
                  {m.now && <><span aria-hidden className="jt-ring" /><span aria-hidden className="jt-ring r2" /></>}
                </span>

                <div className={`jt-card ${m.now ? 'is-now' : ''}`}>
                  <div className="jt-part flex flex-wrap items-center gap-2">
                    <span className="jt-year">{m.when}</span>
                    <span className="jt-tag">{m.tag}</span>
                    {m.now && (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4BE3C8]">
                        <span className="status-dot !h-1.5 !w-1.5" /> Live
                      </span>
                    )}
                  </div>
                  <p className="jt-part mt-3 text-[19px] font-semibold leading-snug text-snow">{m.title}</p>
                  <p className="jt-part mt-0.5 text-[14px] font-medium" style={{ color: m.color }}>{m.sub}</p>
                  <p className="jt-part mt-2 text-[15px] leading-relaxed text-smoke">{m.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        </div>
      </div>
    </section>
  )
}

/** Small hanging lantern that rides the journey line. */
function Lantern() {
  return (
    <svg aria-hidden viewBox="0 0 28 46" width="36" height="59" className="jt-lantern-svg">
      <path d="M14 0v6" stroke="#9AA6BA" strokeWidth="1.2" />
      <circle cx="14" cy="8" r="2.4" fill="none" stroke="#C9A36A" strokeWidth="1.4" />
      <path d="M7 14h14l-2-4H9z" fill="#3A2A18" stroke="#C9A36A" strokeWidth="1" strokeLinejoin="round" />
      <rect x="8" y="14" width="12" height="20" rx="2.5" fill="url(#lt-glass)" stroke="#C9A36A" strokeWidth="1" />
      <path d="M11 14v20M17 14v20" stroke="#C9A36A" strokeOpacity=".55" strokeWidth=".8" />
      <path className="jt-flame" d="M14 19c2.2 2.6 2.6 4.6 1.6 6.6-.6 1.2-1.7 1.8-1.6 1.8s-1.1-.6-1.6-1.8c-1-2 .2-4.4 1.6-6.6z" fill="#FFD27A" />
      <path d="M6.5 34h15l-1.6 4H8.1z" fill="#3A2A18" stroke="#C9A36A" strokeWidth="1" strokeLinejoin="round" />
      <defs>
        <radialGradient id="lt-glass" cx="50%" cy="58%" r="60%">
          <stop stopColor="#FFE3A3" stopOpacity=".95" />
          <stop offset=".55" stopColor="#F5A524" stopOpacity=".55" />
          <stop offset="1" stopColor="#7A4A10" stopOpacity=".35" />
        </radialGradient>
      </defs>
    </svg>
  )
}

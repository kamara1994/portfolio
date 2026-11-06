'use client'
import { useEffect, useRef } from 'react'

type Milestone = {
  when: string
  tag: string
  title: string
  sub: string
  desc: string
  color: string
  icon: React.ReactNode
  now?: boolean
}

const I = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  cap: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></>,
  award: <><circle cx="12" cy="9" r="5" /><path d="M8.5 13l-1.5 8 5-3 5 3-1.5-8" /></>,
  net: <><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="3" y="16" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M6 16v-4h12v4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  shield: <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  rocket: <><path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-5-5z" /><circle cx="15" cy="9" r="1.5" /></>,
}

const MILESTONES: Milestone[] = [
  { when: 'Early years', tag: 'Origin', title: 'Freetown, Sierra Leone', sub: 'Where it started', color: '#F5A524', icon: I.globe,
    desc: 'Born and raised in Freetown. Fascinated by technology from an early age: taking computers apart and learning how networks work.' },
  { when: 'Sep 2023', tag: 'Education', title: 'BYU-Idaho', sub: 'B.S. Cybersecurity program', color: '#4CC9FF', icon: I.cap,
    desc: 'Started the Cybersecurity degree: networking, operating systems, cryptography, and security fundamentals.' },
  { when: 'Mar 2025', tag: 'Certification', title: 'CompTIA Security+', sub: 'First security certification', color: '#4BE3C8', icon: I.award,
    desc: 'Validated core security skills: threat detection, risk management, cryptography, and network security.' },
  { when: 'Earned', tag: 'Certification', title: 'Cisco CCNA', sub: 'Enterprise networking', color: '#38BDF8', icon: I.net,
    desc: 'Routing, switching, and segmentation. Built enterprise branch networks with OSPF, VRRP, EtherChannel, VLANs, and SSH hardening.' },
  { when: 'Mar 2026', tag: 'Certification', title: 'PenTest+ and TCM PSAA', sub: 'Offense and defense', color: '#F97316', icon: I.lock,
    desc: 'Penetration testing on one side; SOC operations, alert triage, and incident response on the other.' },
  { when: '2026', tag: 'Projects', title: 'BLUE SOC, FORTRESS, BLUE-X, PWEZA', sub: 'Security and AI systems built', color: '#7FA6FF', icon: I.shield,
    desc: 'AI-assisted SOC automation, an AWS defense lab deployed with Terraform, a PyTorch threat classifier, and PWEZA, a voice-first portfolio agent.' },
  { when: 'Dec 2026', tag: 'Now', title: 'B.S. Cybersecurity', sub: 'Graduating from BYU-Idaho', color: '#4BE3C8', icon: I.rocket, now: true,
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
    el.querySelectorAll('.rv, .jt-row').forEach((n) => io.observe(n))

    // Draw the beam down with the scroll
    const jt = el.querySelector<HTMLElement>('.jt')
    let raf = 0
    const draw = () => {
      raf = 0
      if (!jt) return
      const r = jt.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - r.top) / r.height))
      jt.style.setProperty('--fill', String(p))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={root} id="story" className="wrap pb-20 pt-24 md:pb-24 md:pt-32">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="rv text-[clamp(18px,1.4vw,22px)] font-medium text-signal">My story</p>
            <h2 className="rv rv-d1 mt-3 font-display text-[clamp(38px,3.8vw,64px)] font-bold uppercase leading-[0.95]">
              Protecting systems means protecting <span className="title-accent">people</span>.
            </h2>
            <div className="mt-8 max-w-[52ch] space-y-5 text-[17px] leading-[1.75] text-snow/80">
              <p className="rv rv-d2">
                I grew up in Freetown, Sierra Leone, where I saw how much everyday life depends on infrastructure that works.
                That is what pulled me into security: not compliance checkboxes, but keeping real systems running for real people.
              </p>
              <p className="rv rv-d3">
                Today I am finishing my B.S. in Cybersecurity at BYU-Idaho and building the work to back it up. I use AI where it
                cuts analyst toil, and I keep a human approving every containment decision.
              </p>
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
          </div>

          <ol className="space-y-5">
            {MILESTONES.map((m) => (
              <li key={m.title} className="jt-row group" style={{ ['--c' as string]: m.color }}>
                <span className={`jt-node ${m.now ? 'is-now' : ''}`}>
                  <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {m.icon}
                  </svg>
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

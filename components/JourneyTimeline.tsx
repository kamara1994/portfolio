'use client'
import { motion } from 'framer-motion'

const milestones = [
  {
    year: '2019',
    title: 'Freetown, Sierra Leone',
    subtitle: 'Where it started',
    desc: 'Born and raised in Freetown. Fascinated by technology from an early age — taking apart computers, learning how networks work, and dreaming of building something that matters.',
    color: '#ffaa00',
    icon: '🌍',
    tag: 'ORIGIN',
  },
  {
    year: '2022',
    title: 'BYU-Idaho',
    subtitle: 'B.S. Cybersecurity Program',
    desc: 'Enrolled in the Cybersecurity degree program. Started building a serious technical foundation — networking, operating systems, cryptography, and security fundamentals.',
    color: '#00d4ff',
    icon: '🎓',
    tag: 'EDUCATION',
  },
  {
    year: '2023',
    title: 'CompTIA Security+',
    subtitle: 'First major certification',
    desc: 'Earned Security+ on the first attempt. Validated core cybersecurity skills including threat detection, risk management, cryptography, and network security fundamentals.',
    color: '#ef4444',
    icon: '🏆',
    tag: 'CERTIFICATION',
  },
  {
    year: '2024',
    title: 'Cisco CCNA',
    subtitle: 'Enterprise networking mastery',
    desc: 'Earned CCNA certification. Designed and configured full enterprise branch networks — OSPF routing, VRRP redundancy, LACP EtherChannel, VLAN segmentation, and SSH hardening.',
    color: '#00bceb',
    icon: '🔗',
    tag: 'CERTIFICATION',
  },
  {
    year: '2024',
    title: 'ELITECOM Engineers',
    subtitle: 'Web Security Developer & Technology Lead',
    desc: 'Designed and built the full web platform for ELITECOM Engineers Sierra Leone — a multi-sector firm spanning telecom, IT, and civil engineering. Security-first architecture deployed to production.',
    color: '#a855f7',
    icon: '🏢',
    tag: 'EXPERIENCE',
  },
  {
    year: '2025',
    title: 'BYU-Idaho IT Help Desk',
    subtitle: 'IT Support Technician',
    desc: 'Supporting 10,000+ users across enterprise systems. Resolving 20+ tickets weekly, escalating security-adjacent incidents, and maintaining technical documentation aligned with IT compliance.',
    color: '#00f5d4',
    icon: '💼',
    tag: 'EXPERIENCE',
  },
  {
    year: '2025',
    title: 'PenTest+ & PSAA',
    subtitle: 'Offensive + Defensive stack complete',
    desc: 'Earned CompTIA PenTest+ and TCM Security Practical SOC Analyst Associate. Full offensive and defensive capability — penetration testing, SOC operations, incident response, and threat triage.',
    color: '#f97316',
    icon: '🔐',
    tag: 'CERTIFICATION',
  },
  {
    year: '2026',
    title: 'BLUE SOC + FORTRESS v2 + BLUE-X',
    subtitle: 'Flagship projects shipped',
    desc: 'Built three major security platforms: BLUE SOC (AI-assisted SOC automation), FORTRESS v2 (AWS cloud security lab with Terraform), and BLUE-X (PyTorch threat classifier — 99.98% accuracy on controlled dataset).',
    color: '#00d4ff',
    icon: '🛡️',
    tag: 'PROJECT',
  },
  {
    year: '2026',
    title: 'Philadelphia, PA — Ready',
    subtitle: 'B.S. Cybersecurity · BYU-Idaho',
    desc: 'Graduating with a B.S. in Cybersecurity. Based in Philadelphia. Targeting SOC Analyst, Security Engineer, and Cloud Security roles. Ready to contribute from day one.',
    color: '#ffaa00',
    icon: '🚀',
    tag: 'NOW',
  },
]

const tagColors: Record<string, string> = {
  ORIGIN: '#ffaa00',
  EDUCATION: '#00d4ff',
  CERTIFICATION: '#00f5d4',
  EXPERIENCE: '#a855f7',
  PROJECT: '#38bdf8',
  NOW: '#ef4444',
}

export default function JourneyTimeline() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
          <span className="w-8 h-px bg-neon" />
          My Story
        </div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-4">
          The <span className="text-cyan">Journey</span>
        </h2>
        <p className="font-mono text-[12px] text-muted max-w-2xl leading-relaxed mb-14">
          From Freetown, Sierra Leone to building AI-powered security systems in Philadelphia.
          Every milestone earned, every certification tested, every project built from scratch.
        </p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.6), rgba(0,212,255,0.1) 80%, transparent)' }} />

          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="flex gap-6 items-start group"
              >
                {/* Icon node */}
                <div className="relative shrink-0 z-10">
                  <motion.div
                    whileInView={{ boxShadow: [`0 0 0px ${m.color}00`, `0 0 20px ${m.color}66`, `0 0 10px ${m.color}33`] }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 + 0.3, duration: 0.8 }}
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg bg-[#020818]"
                    style={{ borderColor: m.color }}
                  >
                    {m.icon}
                  </motion.div>
                  {/* Connecting dot on line */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[1px] w-1 h-1 rounded-full"
                    style={{ background: m.color }} />
                </div>

                {/* Card */}
                <div className="flex-1 border border-[rgba(0,212,255,0.08)] p-5 hover:border-[rgba(0,212,255,0.2)] transition-colors duration-300 relative overflow-hidden"
                  style={{ background: '#010c1e' }}>
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${m.color}60, transparent)` }} />

                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {/* Year */}
                    <span className="font-mono text-[10px] px-2 py-0.5 border font-bold"
                      style={{ color: m.color, borderColor: `${m.color}40`, background: `${m.color}10` }}>
                      {m.year}
                    </span>
                    {/* Tag */}
                    <span className="font-mono text-[8px] px-2 py-0.5 tracking-[2px] uppercase"
                      style={{ color: tagColors[m.tag] || '#8899bb', background: `${tagColors[m.tag]}15` }}>
                      {m.tag}
                    </span>
                  </div>

                  <h3 className="font-orbitron text-[13px] font-bold text-[#e2eaff] mb-0.5">{m.title}</h3>
                  <div className="font-mono text-[10px] mb-3" style={{ color: m.color }}>{m.subtitle}</div>
                  <p className="font-mono text-[11px] text-muted leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.02)] text-center"
        >
          <div className="font-mono text-[10px] text-neon tracking-[3px] uppercase mb-2">What comes next</div>
          <p className="font-mono text-[12px] text-muted mb-4">
            First role in cybersecurity. Contributing from day one. Building the next chapter.
          </p>
          <a href="mailto:kamarajosephallan@gmail.com"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 bg-cyan text-bg hover:bg-neon transition-colors">
            Let's Talk →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

'use client'
// @ts-nocheck
import { motion } from 'framer-motion'

const milestones = [
  {
    year: '2019',
    title: 'Freetown, Sierra Leone',
    subtitle: 'Where it all started',
    desc: 'Born and raised in Freetown. Fascinated by technology from an early age — taking apart computers, learning how networks work, dreaming of building something that matters.',
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
    title: 'BLUE SOC + FORTRESS + BLUE-X + PWEZA',
    subtitle: 'Flagship security and AI systems shipped',
    desc: 'Built major security platforms spanning AI-assisted SOC automation, AWS defense with Terraform, PyTorch threat classification, and PWEZA — a voice-first, multi-model portfolio agent with a companion visitor intelligence pipeline.',
    color: '#00d4ff',
    icon: '🛡️',
    tag: 'PROJECT',
  },
  {
    year: 'DEC 2026',
    title: 'B.S. Cybersecurity Graduation',
    subtitle: 'BYU-Idaho · Expected December 2026',
    desc: 'Expected to graduate with a B.S. in Cybersecurity in December 2026. Based in Philadelphia and available now for SOC Analyst, Security Engineer, Cloud Security, and AI Security opportunities.',
    color: '#00f5d4',
    icon: '🚀',
    tag: 'NOW',
    isNow: true,
  },
]

const tagColors: Record<string, string> = {
  ORIGIN:      '#ffaa00',
  EDUCATION:   '#00d4ff',
  CERTIFICATION:'#00f5d4',
  EXPERIENCE:  '#a855f7',
  PROJECT:     '#38bdf8',
  NOW:         '#00f5d4',
}

export default function JourneyTimeline() {
  return (
    <section className="px-6 py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 font-mono text-neon tracking-[4px] uppercase mb-3" style={{ fontSize: 10 }}>
            <span className="w-8 h-px bg-neon" />
            My Story
          </div>
          <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-4">
            The <span className="text-cyan">Journey</span>
          </h2>
          <p className="font-mono text-muted max-w-2xl leading-relaxed" style={{ fontSize: 12 }}>
            From Freetown, Sierra Leone to building AI-powered security systems in Philadelphia.
            Every milestone earned, every certification tested, every project built from scratch.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">

          {/* Laser beam line */}
          <div
            className="absolute top-2 bottom-2 pointer-events-none"
            style={{ left: 19, width: 2 }}
          >
            {/* Gradient line */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.8) 0%, rgba(0,245,212,0.6) 60%, rgba(0,212,255,0.1) 100%)' }}
            />
            {/* Glow */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,212,255,0.3)', filter: 'blur(4px)', transform: 'scaleX(3)' }}
            />
            {/* Traveling data packets */}
            {[0, 1.2, 2.5, 3.8].map((delay, i) => (
              <div
                key={i}
                className="absolute -left-[3px] rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: i % 2 === 0 ? '#00d4ff' : '#00f5d4',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#00d4ff' : '#00f5d4'}`,
                  animation: `jtPacket 4.5s linear infinite ${delay}s`,
                }}
              />
            ))}
          </div>

          <div className="space-y-5">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="flex gap-6 items-start group"
              >
                {/* Icon node */}
                <div className="relative shrink-0 z-10">
                  <motion.div
                    whileInView={{
                      boxShadow: [
                        `0 0 0px ${m.color}00`,
                        `0 0 22px ${m.color}80`,
                        `0 0 12px ${m.color}40`,
                      ],
                    }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 + 0.3, duration: 0.7 }}
                    className="relative w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg bg-[#020818]"
                    style={{ borderColor: m.color }}
                  >
                    {m.icon}
                    {/* Extra rings for NOW node */}
                    {m.isNow && [1.6, 2.1].map((s, ri) => (
                      <div
                        key={ri}
                        className="absolute inset-0 rounded-full border pointer-events-none"
                        style={{
                          borderColor: m.color,
                          transform: `scale(${s})`,
                          opacity: 0.2,
                          animation: `jtNowPulse ${2 + ri * 0.6}s ease-in-out infinite ${ri * 0.4}s`,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Card */}
                <div
                  className="flex-1 relative overflow-hidden transition-all duration-300 group-hover:translate-x-1"
                  style={{
                    border: `1px solid ${m.isNow ? m.color + '50' : 'rgba(0,212,255,0.1)'}`,
                    background: m.isNow ? `${m.color}06` : '#010c1e',
                    borderLeft: `2px solid ${m.color}`,
                  }}
                >
                  {/* Top shimmer on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `linear-gradient(90deg, transparent, ${m.color}80, transparent)` }}
                  />

                  <div className="p-5">
                    {/* Year + tag */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="font-mono font-bold px-2 py-0.5 border"
                        style={{ fontSize: 10, color: m.color, borderColor: `${m.color}40`, background: `${m.color}12` }}
                      >
                        {m.year}
                      </span>
                      <span
                        className="font-mono tracking-[2px] uppercase px-2 py-0.5"
                        style={{
                          fontSize: 8,
                          color: tagColors[m.tag] || '#8899bb',
                          background: `${tagColors[m.tag] || '#8899bb'}15`,
                        }}
                      >
                        {m.tag}
                      </span>
                      {m.isNow && (
                        <span className="flex items-center gap-1.5 font-mono tracking-[2px] uppercase" style={{ fontSize: 8, color: '#00f5d4' }}>
                          <span className="w-1 h-1 rounded-full bg-neon animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    <h3 className="font-orbitron font-bold text-[#e2eaff] mb-0.5 leading-tight" style={{ fontSize: 13 }}>
                      {m.title}
                    </h3>
                    <div className="font-mono mb-3" style={{ fontSize: 10, color: m.color }}>
                      {m.subtitle}
                    </div>
                    <p className="font-mono text-muted leading-relaxed" style={{ fontSize: 11 }}>
                      {m.desc}
                    </p>
                  </div>
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
          className="mt-12 p-6 border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.02)] text-center relative overflow-hidden"
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }}
          />
          <div className="font-mono text-neon tracking-[3px] uppercase mb-2" style={{ fontSize: 10 }}>
            What comes next
          </div>
          <p className="font-mono text-muted mb-5" style={{ fontSize: 12 }}>
            First role in cybersecurity. Contributing from day one. Building the next chapter.
          </p>
          <a
            href="mailto:kamarajosephallan@gmail.com"
            className="inline-flex items-center gap-2 font-mono tracking-[2px] uppercase px-7 py-3 bg-cyan text-bg hover:bg-neon transition-colors"
            style={{ fontSize: 11 }}
          >
            Let's Talk →
          </a>
        </motion.div>
      </div>

      <style>{`
        @keyframes jtPacket {
          0%   { top: -8px; opacity: 0; }
          5%   { opacity: 1; }
          92%  { opacity: 0.9; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes jtNowPulse {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </section>
  )
}

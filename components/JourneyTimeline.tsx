'use client'
import { motion } from 'framer-motion'

const milestones = [
  { year: '2019', title: 'Sierra Leone', desc: 'Born and raised in Freetown, Sierra Leone. Developed passion for technology and problem solving.', color: '#ffaa00', icon: '🌍' },
  { year: '2022', title: 'BYU-Idaho', desc: 'Enrolled in B.S. Cybersecurity program. Began building technical foundation in networking and security.', color: '#00d4ff', icon: '🎓' },
  { year: '2023', title: 'CompTIA Security+', desc: 'Earned Security+ certification. First major milestone in professional cybersecurity career.', color: '#00f5d4', icon: '🏆' },
  { year: '2024', title: 'Cisco CCNA', desc: 'Earned CCNA certification. Built enterprise networking projects including multi-site Cisco deployments.', color: '#0099ff', icon: '🔗' },
  { year: '2024', title: 'ELITECOM Engineers', desc: 'Became Technology Lead and CISO for ELITECOM Engineers Sierra Leone. Built full web platform.', color: '#aa44ff', icon: '🏢' },
  { year: '2025', title: 'BYU-Idaho IT Help Desk', desc: 'IT Support Technician supporting 10,000+ users. Escalating security incidents and maintaining enterprise systems.', color: '#00f5d4', icon: '💼' },
  { year: '2025', title: 'PenTest+ & PSAA', desc: 'Earned CompTIA PenTest+ and TCM Practical SOC Analyst Associate. Full offensive and defensive stack.', color: '#ff4444', icon: '🔐' },
  { year: '2026', title: 'FORTRESS v2 + BLUE-X', desc: 'Built AWS cloud security lab with Terraform and AI-powered threat classification platform with 99.98% accuracy.', color: '#00d4ff', icon: '🛡️' },
  { year: '2026', title: 'Graduation', desc: 'B.S. Cybersecurity — BYU-Idaho. Ready for SOC Analyst, Security Engineer, or AI Security roles.', color: '#ffaa00', icon: '🚀' },
]

export default function JourneyTimeline() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">My Story</div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-12">The <span className="text-cyan">Journey</span></h2>
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(0,212,255,0.5)] via-[rgba(0,212,255,0.2)] to-transparent" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-6 items-start">
                <div className="relative shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-[16px] z-10 bg-[#020818]"
                  style={{ borderColor: m.color, boxShadow: `0 0 12px ${m.color}44` }}>
                  {m.icon}
                </div>
                <div className="glass-card p-5 flex-1 hover:border-[rgba(0,212,255,0.2)] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 border" style={{ color: m.color, borderColor: `${m.color}44` }}>{m.year}</span>
                    <h3 className="font-orbitron text-sm font-bold text-[#e2eaff]">{m.title}</h3>
                  </div>
                  <p className="font-mono text-[11px] text-muted leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

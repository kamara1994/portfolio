'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const stats = [
  { label: 'Education', val: 'BS Cybersecurity, BYUI' },
  { label: 'Location', val: 'Remote-Ready, U.S.' },
  { label: 'Focus', val: 'AI + Security Automation' },
  { label: 'Top Certs', val: 'Security+ / CCNA / PSAA' },
  { label: 'Status', val: '🟢 Open to Work', highlight: true },
  { label: 'Auth', val: 'U.S. Work Eligible' },
]

export default function About() {
  return (
    <section id="about" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Background" title="About " accent="Me" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 items-start">

          {/* TEXT — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-5"
          >
            <p className="text-[15px] text-muted leading-[1.9]">
              I grew up in <strong className="text-[#e2eaff]">Sierra Leone</strong>, where I saw firsthand how critical infrastructure shapes lives. That background gave me a mission-driven perspective: <span className="text-cyan">protecting systems means protecting people</span>.
            </p>
            <p className="text-[15px] text-muted leading-[1.9]">
              I transitioned into cybersecurity with a builder's mindset. My flagship project, <strong className="text-[#e2eaff]">BLUE SOC P8</strong>, is a fully autonomous AI-powered Security Operations Center I designed and built from the ground up — integrating Splunk, Palo Alto, Claude LLM, and n8n orchestration into a production-grade system.
            </p>
            <p className="text-[15px] text-muted leading-[1.9]">
              What makes me different is the intersection of <span className="text-cyan">deep security knowledge</span> and <span className="text-neon">applied AI development</span>. I use LLMs as a force multiplier — integrating them into real security workflows that reduce analyst toil and improve response time.
            </p>
            <p className="text-[15px] text-muted leading-[1.9]">
              I hold CompTIA Security+, Cisco CCNA, and TCM PSAA certifications. I'm actively targeting roles as a <strong className="text-[#e2eaff]">SOC Analyst, Security Engineer, or AI Security Engineer</strong>, remote-preferred.
            </p>

            {/* TERMINAL QUOTE */}
            <div className="terminal-box mt-8">
              <div className="terminal-bar">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">mission.txt</span>
              </div>
              <div className="p-5 font-mono text-[12px] text-muted leading-7">
                <span className="text-neon">// </span>
                "I don't just study threats. I build the systems that detect, analyze, and respond to them — before attackers even know they've been seen."
              </div>
            </div>
          </motion.div>

          {/* STATS — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-px bg-[rgba(0,212,255,0.05)]"
          >
            {stats.map((s, i) => (
              <div key={i} className="glass-card px-6 py-4 flex justify-between items-center">
                <span className="text-[13px] text-muted">{s.label}</span>
                <span className={`font-mono text-[12px] ${s.highlight ? 'text-neon' : 'text-cyan2'}`}>{s.val}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}

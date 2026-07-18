'use client'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const stats = [
  { label: 'Degree',     val: 'B.S. Cybersecurity · Dec 2026' },
  { label: 'Location',   val: 'Philadelphia, PA · Remote-First' },
  { label: 'Focus',      val: 'SOC Automation · AI Security · Cloud' },
  { label: 'Certs',      val: 'Security+ · CCNA · PenTest+ · PSAA' },
  { label: 'Status',     val: '🟢 Open to Work · Available Now', highlight: true },
  { label: 'Work Auth',  val: 'U.S. Work Authorized' },
  { label: 'Response',   val: '< 24 hours' },
]

const differentiators = [
  {
    icon: '🔵',
    title: 'Engineering backed by evidence',
    desc: 'Every featured system documents the architecture, tools, decisions, validation process, and measurable outcome behind the work.',
  },
  {
    icon: '🤖',
    title: 'AI and security together',
    desc: 'I integrate LLMs into security workflows — not as a novelty, but as a force multiplier that reduces analyst toil and accelerates response.',
  },
  {
    icon: '🌍',
    title: 'Mission-driven perspective',
    desc: 'Growing up in Sierra Leone showed me how critical infrastructure shapes lives. Protecting systems means protecting people. That drives everything I build.',
  },
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
            className="lg:col-span-3 space-y-6"
          >
            <p className="text-[15px] text-muted leading-[1.9]">
              I grew up in <strong className="text-[#e2eaff]">Freetown, Sierra Leone</strong> and moved to the U.S. to study cybersecurity at BYU-Idaho. That background gave me something most engineers in this field don't have — a firsthand understanding of why infrastructure security matters beyond compliance checkboxes.{' '}
              <span className="text-cyan">Protecting systems means protecting people.</span>
            </p>

            <p className="text-[15px] text-muted leading-[1.9]">
              I came into this field as a builder. While studying, I designed and built{' '}
              <strong className="text-[#e2eaff]">BLUE SOC</strong> — an AI-assisted SOC automation prototype connecting Splunk SIEM, n8n orchestration, Claude LLM triage, Palo Alto response workflows, and real-time Telegram notifications. All analyst-reviewed. All documented.
            </p>

            <p className="text-[15px] text-muted leading-[1.9]">
              I also built <strong className="text-[#e2eaff]">FORTRESS v2</strong> — a full AWS cloud security lab deployed with Terraform, validated with 5 real attack simulations — and <strong className="text-[#e2eaff]">BLUE-X</strong>, a PyTorch neural network trained on 50,000 network flows achieving 99.98% classification accuracy on a controlled dataset.
            </p>

            <p className="text-[15px] text-muted leading-[1.9]">
              I engineered <strong className="text-[#e2eaff]">PWEZA</strong> as a voice-first AI portfolio agent with multi-model routing, structured project knowledge, persistent speech sessions, neural text-to-speech, and resilient local fallbacks. Its companion visitor intelligence agent enriches server-side visit signals and delivers privacy-conscious, approximate location alerts through Telegram.
            </p>

            <p className="text-[15px] text-muted leading-[1.9]">
              I'm completing my <strong className="text-[#e2eaff]">B.S. in Cybersecurity at BYU-Idaho in December 2026</strong>. I also hold <span className="text-cyan">CompTIA Security+</span>, <span className="text-cyan">PenTest+</span>, <span className="text-cyan">Cisco CCNA</span>, and <span className="text-cyan">TCM PSAA</span> certifications. I'm available now for SOC Analyst, Security Engineer, Cloud Security, and AI Security opportunities.
            </p>

            {/* Differentiators */}
            <div className="space-y-3 pt-2">
              {differentiators.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)] transition-colors"
                >
                  <span className="text-xl shrink-0">{d.icon}</span>
                  <div>
                    <div className="font-mono text-[11px] font-bold text-cyan mb-1">{d.title}</div>
                    <p className="font-mono text-[11px] text-muted leading-relaxed">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Terminal quote */}
            <div className="terminal-box mt-4">
              <div className="terminal-bar">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">mission.txt</span>
              </div>
              <div className="p-5 font-mono text-[12px] text-muted leading-7">
                <span className="text-neon">// </span>
                "I don't just study threats. I build the systems that detect, analyze, and respond to them — with the evidence to prove it."
              </div>
            </div>
          </motion.div>

          {/* STATS — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-px"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card px-6 py-4 flex justify-between items-center hover:border-[rgba(0,212,255,0.2)] transition-colors"
              >
                <span className="font-mono text-[11px] text-muted">{s.label}</span>
                <span className={`font-mono text-[11px] text-right ${s.highlight ? 'text-neon' : 'text-cyan'}`}>
                  {s.val}
                </span>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <a
                href="mailto:kamarajosephallan@gmail.com"
                className="w-full block text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 bg-cyan text-bg hover:bg-neon transition-colors"
              >
                Let's Talk →
              </a>
              <a
                href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf"
                target="_blank"
                className="w-full block text-center font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 border border-[rgba(0,212,255,0.3)] text-cyan hover:border-cyan transition-colors mt-2"
              >
                ↓ Download Resume
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

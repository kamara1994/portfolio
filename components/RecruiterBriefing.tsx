'use client'
import { motion } from 'framer-motion'

const highlights = [
  {
    icon: '🎓',
    label: 'Certified',
    value: 'Security+ · PenTest+ · CCNA · PSAA · AWS Security (in progress)',
  },
  {
    icon: '🔵',
    label: 'Flagship Project',
    value: 'BLUE SOC — Splunk → n8n → AI-assisted triage → Palo Alto workflow → Telegram alerting',
  },
  {
    icon: '☁️',
    label: 'Cloud Security',
    value: 'FORTRESS v2 — AWS GuardDuty, Terraform IaC, Lambda remediation, 5 attack simulations',
  },
  {
    icon: '🤖',
    label: 'AI Security',
    value: 'BLUE-X — PyTorch threat classifier, 50k samples, 99.98% accuracy on controlled dataset',
  },
  {
    icon: '🎯',
    label: 'Target Roles',
    value: 'SOC Analyst · Security Engineer · Cloud Security · AI Security',
  },
]

export default function RecruiterBriefing() {
  return (
    <section id="briefing" className="px-6 py-20">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
            <span className="w-8 h-px bg-neon" />
            Recruiter Briefing
          </div>
          <h2 className="font-orbitron font-bold text-2xl text-[#e2eaff] mb-2">
            Why Joseph for a Security Role?
          </h2>
          <p className="font-mono text-[11px] text-muted tracking-[2px] mb-10 opacity-60 uppercase">
            CANDIDATE BRIEF // UNCLASSIFIED // 30-SECOND OVERVIEW
          </p>

          <div className="border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.02)] p-8 relative">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan opacity-60" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan opacity-60" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan opacity-60" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan opacity-60" />

            <div className="space-y-5">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 items-start"
                >
                  <span className="text-lg mt-0.5 shrink-0">{h.icon}</span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <span className="font-mono text-[10px] tracking-[2px] text-neon uppercase shrink-0 w-28">
                      {h.label}
                    </span>
                    <span className="text-[#b0c4d8] text-sm leading-relaxed">
                      {h.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-[rgba(0,212,255,0.1)]">
              <a
                href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf"
                target="_blank"
                className="btn-hex bg-cyan text-bg font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 hover:bg-neon"
              >
                ↓ Download Resume
              </a>
              <a
                href="/blue-soc-brief"
                target="_blank"
                className="btn-hex border border-[rgba(129,140,248,0.4)] text-purple-400 font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 hover:bg-[rgba(129,140,248,0.08)]"
              >
                ↓ BLUE SOC Brief
              </a>
              <a
                href="#projects"
                className="btn-hex border border-cyan text-cyan font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 hover:bg-[rgba(0,212,255,0.08)]"
              >
                Explore BLUE SOC
              </a>
              <a
                href="/incident-replay"
                className="btn-hex font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 flex items-center gap-2 border border-[rgba(0,245,212,0.4)] text-neon hover:bg-[rgba(0,245,212,0.06)] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0" />
                Incident Lab
              </a>
              <a
                href="https://github.com/kamara1994"
                target="_blank"
                className="btn-hex border border-[rgba(0,212,255,0.3)] text-muted font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 hover:border-cyan hover:text-cyan"
              >
                View GitHub
              </a>
              <a
                href="#contact"
                className="btn-hex border border-[rgba(0,212,255,0.3)] text-muted font-mono text-[10px] tracking-[2px] uppercase px-6 py-2.5 hover:border-neon hover:text-neon"
              >
                Contact Joseph
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

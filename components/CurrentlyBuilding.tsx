'use client'
import { motion } from 'framer-motion'

type BuildStatus = 'in-progress' | 'planned' | 'research'

interface CurrentBuild {
  id: string
  title: string
  subtitle: string
  status: BuildStatus
  progress?: number
  description: string
  stack: string[]
  eta?: string
  category: string
}

const currentBuilds: CurrentBuild[] = [
  {
    id: 'incident-replay-lab',
    title: 'Incident Replay Lab',
    subtitle: 'Interactive SOC Investigation Experience',
    status: 'in-progress',
    progress: 35,
    category: 'AI Security',
    description: 'An interactive investigation timeline letting visitors walk through real SOC incidents step by step — phishing analysis, IOC extraction, MITRE ATT&CK mapping, and response decisions. Built to demonstrate analytical thinking, not just visual effects.',
    stack: ['Next.js', 'TypeScript', 'Framer Motion', 'MITRE ATT&CK'],
    eta: 'Q2 2026',
  },
  {
    id: 'blue-research-lab',
    title: 'BLUE Research Lab',
    subtitle: 'Experimental Security Engineering Sandbox',
    status: 'in-progress',
    progress: 20,
    category: 'Research',
    description: 'A dedicated experimental zone for advanced security engineering demos — SOC analyst terminal, prompt injection defense lab, WASM log parser, and optional local AI analysis. Clearly labeled as experimental, not production.',
    stack: ['WebAssembly', 'Rust', 'WebGPU', 'Next.js', 'TypeScript'],
    eta: 'Q3 2026',
  },
  {
    id: 'aws-security-automation',
    title: 'AWS Security Automation v2',
    subtitle: 'Advanced Cloud Incident Response Pipeline',
    status: 'in-progress',
    progress: 15,
    category: 'Cloud Security',
    description: 'Expanding FORTRESS v2 with a full automated incident response pipeline — GuardDuty finding → EventBridge → Step Functions state machine → analyst-approved Lambda remediation → audit trail. Full Terraform IaC with documented approval thresholds.',
    stack: ['AWS', 'Terraform', 'Step Functions', 'EventBridge', 'Lambda', 'Python'],
    eta: 'Q3 2026',
  },
  {
    id: 'blue-soc-case-study',
    title: 'BLUE SOC Deep Case Study',
    subtitle: 'Full Technical Evidence Documentation',
    status: 'in-progress',
    progress: 50,
    category: 'Documentation',
    description: 'A comprehensive written case study for BLUE SOC covering architecture decisions, what worked, what needed adjustment, evidence screenshots, sanitized configuration snippets, and what a production deployment would require. Honest and detailed.',
    stack: ['Technical Writing', 'Architecture Diagrams', 'Evidence Documentation'],
    eta: 'Q2 2026',
  },
  {
    id: 'blue-career-v2',
    title: 'BLUE Career Intelligence v2',
    subtitle: 'Job Intelligence Pipeline — Private',
    status: 'in-progress',
    progress: 60,
    category: 'AI Automation',
    description: 'Upgraded job intelligence pipeline with improved fit scoring, structured company research, and application tracking. Python-based with Claude API integration for analysis.',
    stack: ['Python', 'Claude API', 'n8n', 'PostgreSQL'],
    eta: 'Active',
  },
  {
    id: 'soc-analyst-terminal',
    title: 'SOC Analyst Terminal',
    subtitle: 'Interactive Command-Line Portfolio Interface',
    status: 'planned',
    category: 'Portfolio',
    description: 'A fully interactive terminal interface for the portfolio with real SOC-relevant commands — incident replay, splunk-query, mitre-map, ioc-extract, verify-certs. Demonstrates hands-on analyst thinking through a command-line experience.',
    stack: ['TypeScript', 'Next.js', 'WebAssembly'],
    eta: 'Q3 2026',
  },
]

const statusConfig: Record<BuildStatus, { label: string; color: string; bg: string; dotColor: string }> = {
  'in-progress': {
    label: 'IN PROGRESS',
    color: 'text-cyan',
    bg: 'bg-[rgba(0,212,255,0.08)]',
    dotColor: 'bg-cyan',
  },
  'planned': {
    label: 'PLANNED',
    color: 'text-purple-400',
    bg: 'bg-[rgba(168,85,247,0.08)]',
    dotColor: 'bg-purple-400',
  },
  'research': {
    label: 'RESEARCH',
    color: 'text-[#ffaa00]',
    bg: 'bg-[rgba(255,170,0,0.08)]',
    dotColor: 'bg-[#ffaa00]',
  },
}

export default function CurrentlyBuilding() {
  return (
    <section id="currently-building" className="px-6 py-20">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
            <span className="w-8 h-px bg-neon" />
            Active Development
          </div>
          <h2 className="font-orbitron font-bold text-3xl text-[#e2eaff] mb-3">
            Currently Building
          </h2>
          <p className="text-muted text-[14px] max-w-2xl leading-relaxed">
            What I'm actively working on right now. These are real projects in various stages of development — not vaporware. Progress percentages reflect current build state.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentBuilds.map((build, i) => {
            const config = statusConfig[build.status]
            return (
              <motion.div
                key={build.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.02)] p-6 relative group hover:border-[rgba(0,212,255,0.3)] transition-colors duration-300"
              >
                {/* Corner accents */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan opacity-40 group-hover:opacity-80 transition-opacity" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan opacity-40 group-hover:opacity-80 transition-opacity" />

                {/* Status badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`flex items-center gap-2 font-mono text-[9px] tracking-[2px] uppercase px-2 py-1 ${config.color} ${config.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${build.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                    {config.label}
                  </span>
                  {build.eta && (
                    <span className="font-mono text-[9px] text-muted tracking-[1px]">
                      ETA: {build.eta}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="font-mono text-[9px] text-purple-400 tracking-[2px] uppercase mb-2">
                  {build.category}
                </div>

                {/* Title */}
                <h3 className="font-orbitron font-bold text-[#e2eaff] text-sm mb-1">
                  {build.title}
                </h3>
                <p className="font-mono text-[10px] text-muted mb-3">
                  {build.subtitle}
                </p>

                {/* Description */}
                <p className="text-[13px] text-[#8899aa] leading-relaxed mb-4">
                  {build.description}
                </p>

                {/* Progress bar */}
                {build.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[9px] text-muted uppercase tracking-[1px]">Build Progress</span>
                      <span className="font-mono text-[9px] text-cyan">{build.progress}%</span>
                    </div>
                    <div className="h-px w-full bg-[rgba(0,212,255,0.1)]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${build.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-cyan to-neon"
                      />
                    </div>
                  </div>
                )}

                {/* Stack */}
                <div className="flex flex-wrap gap-1.5">
                  {build.stack.map(s => (
                    <span key={s} className="font-mono text-[9px] px-2 py-0.5 border border-[rgba(0,212,255,0.15)] text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 pt-6 border-t border-[rgba(0,212,255,0.08)] flex items-start gap-3"
        >
          <span className="text-neon font-mono text-[10px] shrink-0 mt-0.5">NOTE</span>
          <p className="font-mono text-[10px] text-muted leading-relaxed">
            All projects listed as &quot;in-progress&quot; are actively being developed alongside job searching and coursework. Progress is honest — not marketing. Check{' '}
            <a
              href="https://github.com/kamara1994"
              target="_blank"
              className="text-cyan hover:underline"
            >
              GitHub
            </a>
            {' '}for commit activity.
          </p>
        </motion.div>

      </div>
    </section>
  )
}

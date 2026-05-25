'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { projects } from '@/data/projects'
import { useProjectModal } from '@/components/ProjectModal'

// ── In-Progress / Upcoming builds ──────────────────────────────────────────
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
    description: 'Walk through real SOC incidents step-by-step — phishing analysis, IOC extraction, MITRE ATT&CK mapping, and response decisions. Proves analytical thinking, not just visual effects.',
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
    description: 'Dedicated experimental zone — SOC analyst terminal, prompt injection defense lab, WASM log parser, optional local AI analysis. Clearly labeled experimental.',
    stack: ['WebAssembly', 'Rust', 'WebGPU', 'Next.js', 'TypeScript'],
    eta: 'Q3 2026',
  },
  {
    id: 'aws-security-v2',
    title: 'AWS Security Automation v2',
    subtitle: 'Advanced Cloud Incident Response Pipeline',
    status: 'in-progress',
    progress: 15,
    category: 'Cloud Security',
    description: 'Expanding FORTRESS v2 with Step Functions state machine, analyst-approved Lambda remediation, and full audit trail. Complete Terraform IaC.',
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
    description: 'Comprehensive written case study covering architecture decisions, evidence screenshots, sanitized configs, and what production deployment would require.',
    stack: ['Technical Writing', 'Architecture Diagrams', 'Evidence Docs'],
    eta: 'Q2 2026',
  },
  {
    id: 'blue-career-v2',
    title: 'BLUE Career Intelligence v2',
    subtitle: 'Job Intelligence Pipeline',
    status: 'in-progress',
    progress: 60,
    category: 'AI Automation',
    description: 'Upgraded job intelligence pipeline with improved fit scoring, company research, and application tracking. Python + Claude API.',
    stack: ['Python', 'Claude API', 'n8n', 'PostgreSQL'],
    eta: 'Active',
  },
  {
    id: 'soc-terminal',
    title: 'SOC Analyst Terminal',
    subtitle: 'Interactive CLI Portfolio Interface',
    status: 'planned',
    category: 'Portfolio',
    description: 'Fully interactive terminal with real SOC commands — incident replay, splunk-query, mitre-map, ioc-extract, verify-certs. Analyst thinking through CLI.',
    stack: ['TypeScript', 'Next.js', 'WebAssembly'],
    eta: 'Q3 2026',
  },
]

// ── Difficulty bars ─────────────────────────────────────────────────────────
const DIFFICULTY: Record<string, { complexity: number; impact: number; time: string }> = {
  'blue-soc-p8': { complexity: 9, impact: 10, time: '3 months' },
  'fortress-v2': { complexity: 9, impact: 9, time: '6 weeks' },
  'blue-x': { complexity: 10, impact: 10, time: '4 weeks' },
  'blue-v3': { complexity: 8, impact: 9, time: '2 months' },
  'enterprise-networking': { complexity: 7, impact: 8, time: '4 months' },
  'threat-intel-dashboard': { complexity: 6, impact: 7, time: '3 weeks' },
  'cve-scanner': { complexity: 5, impact: 7, time: '2 weeks' },
  'python-ids': { complexity: 5, impact: 6, time: '2 weeks' },
  'security-automation-toolkit': { complexity: 4, impact: 6, time: '3 weeks' },
  'elitecom': { complexity: 6, impact: 7, time: '6 weeks' },
  'pandie-foundation': { complexity: 5, impact: 6, time: '4 weeks' },
}

function DifficultyBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-1.5 w-3 rounded-sm transition-all"
          style={{ background: i < value ? color : 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  )
}

// ── Status badge config ──────────────────────────────────────────────────────
const statusConfig: Record<BuildStatus, { label: string; color: string; bg: string; dotColor: string }> = {
  'in-progress': { label: 'IN PROGRESS', color: 'text-cyan', bg: 'bg-[rgba(0,212,255,0.08)]', dotColor: 'bg-cyan' },
  'planned': { label: 'PLANNED', color: 'text-purple-400', bg: 'bg-[rgba(168,85,247,0.08)]', dotColor: 'bg-purple-400' },
  'research': { label: 'RESEARCH', color: 'text-[#ffaa00]', bg: 'bg-[rgba(255,170,0,0.08)]', dotColor: 'bg-[#ffaa00]' },
}

// ── Project status badge ────────────────────────────────────────────────────
const projectStatusLabels: Record<string, { label: string; color: string }> = {
  'lab-validated': { label: 'LAB-VALIDATED', color: '#00f5d4' },
  'live-demo':     { label: 'LIVE DEMO',      color: '#00d4ff' },
  'case-study':    { label: 'CASE STUDY',     color: '#818cf8' },
  'in-development':{ label: 'IN DEV',         color: '#ffaa00' },
  'verified':      { label: 'VERIFIED',       color: '#00f5d4' },
}

// ── Video preview modal ──────────────────────────────────────────────────────
function VideoModal({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(2,8,24,0.95)] backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-mono text-[9px] text-neon tracking-[3px] uppercase mb-1">Project Demo</div>
            <div className="font-orbitron text-lg font-bold text-[#e2eaff]">{title}</div>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[11px] text-muted hover:text-cyan border border-[rgba(0,212,255,0.2)] px-3 py-1.5 hover:border-cyan transition-colors"
          >
            ESC
          </button>
        </div>
        <div className="border border-[rgba(0,212,255,0.2)] overflow-hidden bg-black">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-mono text-[10px] text-muted ml-2">{title} — demo.mp4</span>
          </div>
          <video
            src={src}
            controls
            autoPlay
            className="w-full max-h-[60vh] object-contain bg-black"
          />
        </div>
        <p className="font-mono text-[10px] text-muted mt-3 text-center">
          Click outside or press ESC to close
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
type MainTab = 'built' | 'building'

export default function ProjectsFilter() {
  const [mainTab, setMainTab] = useState<MainTab>('built')
  const [activeCategory, setActiveCategory] = useState('All')
  const [videoModal, setVideoModal] = useState<{ src: string; title: string } | null>(null)
  const { open, Modal } = useProjectModal()

  const availableCategories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]
  const filtered = activeCategory === 'All' ? projects : projects.filter(p => p.category === activeCategory)

  return (
    <section id="projects" className="px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">Portfolio</div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-6">
          Featured <span className="text-cyan">Projects</span>
        </h2>

        {/* ── Main tabs: Built vs Building ── */}
        <div className="flex gap-0 mb-8 border border-[rgba(0,212,255,0.15)] w-fit overflow-hidden">

          {/* BUILT tab */}
          <button
            onClick={() => setMainTab('built')}
            className={`font-mono text-[10px] tracking-[2px] uppercase px-6 py-3 flex items-center gap-2 transition-all duration-300 border-r border-[rgba(0,212,255,0.15)] ${
              mainTab === 'built'
                ? 'bg-[rgba(0,212,255,0.1)] text-cyan'
                : 'text-muted hover:text-cyan'
            }`}
          >
            BUILT
            <span className={`font-mono text-[9px] px-1.5 py-0.5 ${
              mainTab === 'built' ? 'bg-[rgba(0,212,255,0.2)] text-cyan' : 'bg-[rgba(255,255,255,0.05)] text-muted'
            }`}>
              {projects.length}
            </span>
          </button>

          {/* CURRENTLY BUILDING tab — slow color-shift glow */}
          <motion.button
            onClick={() => setMainTab('building')}
            className="font-mono text-[10px] tracking-[2px] uppercase px-6 py-3 flex items-center gap-2.5 transition-all duration-300 relative"
            animate={{
              color: [
                '#00f5d4',
                '#00d4ff',
                '#818cf8',
                '#a855f7',
                '#ef4444',
                '#f59e0b',
                '#00f5d4',
              ],
              boxShadow: mainTab === 'building' ? [
                'inset 0 0 30px rgba(0,245,212,0.12)',
                'inset 0 0 30px rgba(0,212,255,0.12)',
                'inset 0 0 30px rgba(129,140,248,0.12)',
                'inset 0 0 30px rgba(168,85,247,0.12)',
                'inset 0 0 30px rgba(239,68,68,0.12)',
                'inset 0 0 30px rgba(245,158,11,0.12)',
                'inset 0 0 30px rgba(0,245,212,0.12)',
              ] : [
                'inset 0 0 0px rgba(0,245,212,0)',
                'inset 0 0 0px rgba(0,212,255,0)',
                'inset 0 0 0px rgba(129,140,248,0)',
                'inset 0 0 0px rgba(168,85,247,0)',
                'inset 0 0 0px rgba(239,68,68,0)',
                'inset 0 0 0px rgba(245,158,11,0)',
                'inset 0 0 0px rgba(0,245,212,0)',
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Color-shifting dot */}
            <motion.span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              animate={{
                backgroundColor: [
                  '#00f5d4',
                  '#00d4ff',
                  '#818cf8',
                  '#a855f7',
                  '#ef4444',
                  '#f59e0b',
                  '#00f5d4',
                ],
                boxShadow: [
                  '0 0 8px 2px #00f5d4',
                  '0 0 8px 2px #00d4ff',
                  '0 0 8px 2px #818cf8',
                  '0 0 8px 2px #a855f7',
                  '0 0 8px 2px #ef4444',
                  '0 0 8px 2px #f59e0b',
                  '0 0 8px 2px #00f5d4',
                ],
                scale: [1, 1.3, 1, 1.3, 1],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            CURRENTLY BUILDING
            <motion.span
              className="font-mono text-[9px] px-1.5 py-0.5"
              animate={{
                backgroundColor: [
                  'rgba(0,245,212,0.15)',
                  'rgba(0,212,255,0.15)',
                  'rgba(129,140,248,0.15)',
                  'rgba(168,85,247,0.15)',
                  'rgba(239,68,68,0.15)',
                  'rgba(245,158,11,0.15)',
                  'rgba(0,245,212,0.15)',
                ],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {currentBuilds.length}
            </motion.span>
          </motion.button>

        </div>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════
              TAB: BUILT PROJECTS
          ════════════════════════════════════════ */}
          {mainTab === 'built' && (
            <motion.div
              key="built"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {availableCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`font-mono text-[9px] tracking-[2px] uppercase px-3 py-1.5 border transition-all ${
                      activeCategory === cat
                        ? 'border-cyan text-cyan bg-[rgba(0,212,255,0.08)]'
                        : 'border-[rgba(0,212,255,0.15)] text-muted hover:border-[rgba(0,212,255,0.3)] hover:text-cyan'
                    }`}>
                    {cat}
                  </button>
                ))}
                <span className="font-mono text-[9px] text-muted self-center ml-2">
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((project, i) => {
                    const diff = DIFFICULTY[project.id]
                    const statusInfo = project.status ? projectStatusLabels[project.status] : null

                    return (
                      <motion.div key={project.id} layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}>
                        <div className="group relative overflow-hidden border border-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.35)] transition-all duration-300 h-full"
                          style={{ background: '#010c1e' }}>

                          {/* Screenshot / video preview */}
                          <div className="relative w-full h-56 overflow-hidden">
                            {project.screenshot ? (
                              <img
                                src={project.screenshot}
                                alt={project.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(129,140,248,0.05))' }}>
                                <div className="font-orbitron text-6xl font-black text-[rgba(0,212,255,0.1)]">{project.num}</div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#010c1e] via-transparent to-transparent" />

                            {/* Video play button overlay */}
                            {project.video && (
                              <button
                                onClick={() => setVideoModal({ src: project.video!, title: project.title })}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[rgba(0,0,0,0.5)]"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-14 h-14 rounded-full border-2 border-cyan flex items-center justify-center bg-[rgba(0,212,255,0.15)] hover:bg-[rgba(0,212,255,0.25)] transition-colors">
                                    <span className="text-cyan text-xl ml-1">▶</span>
                                  </div>
                                  <span className="font-mono text-[9px] text-cyan tracking-[2px] uppercase">Watch Demo</span>
                                </div>
                              </button>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
                              {project.featured && (
                                <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,245,212,0.5)] text-neon bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
                                  FLAGSHIP
                                </span>
                              )}
                              {statusInfo && (
                                <span
                                  className="font-mono text-[8px] px-2 py-1 border bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
                                  style={{ borderColor: `${statusInfo.color}50`, color: statusInfo.color }}
                                >
                                  {statusInfo.label}
                                </span>
                              )}
                              {project.demo && (
                                <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,212,255,0.5)] text-cyan bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-cyan animate-pulse" />
                                  LIVE
                                </span>
                              )}
                              {project.video && (
                                <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(168,85,247,0.5)] text-purple-400 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex items-center gap-1">
                                  ▶ VIDEO
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 left-3 font-orbitron text-2xl font-black text-[rgba(0,212,255,0.3)]">
                              {project.num}
                            </div>
                          </div>

                          {/* Card content */}
                          <div className="p-5">
                            <div className="font-mono text-[9px] text-cyan tracking-[2px] uppercase mb-2">{project.category}</div>
                            <h3 className="font-orbitron text-base font-bold text-[#e2eaff] mb-1 group-hover:text-cyan transition-colors leading-tight">
                              {project.title}
                            </h3>
                            <p className="font-mono text-[10px] text-muted mb-4 leading-relaxed line-clamp-2">{project.subtitle}</p>

                            {diff && (
                              <div className="space-y-2 mb-4">
                                <div>
                                  <div className="font-mono text-[8px] text-muted tracking-wider mb-1">COMPLEXITY</div>
                                  <DifficultyBar value={diff.complexity} color="#00d4ff" />
                                </div>
                                <div>
                                  <div className="font-mono text-[8px] text-muted tracking-wider mb-1">IMPACT</div>
                                  <DifficultyBar value={diff.impact} color="#00f5d4" />
                                </div>
                                <div className="font-mono text-[8px] text-[rgba(0,212,255,0.4)]">⏱ {diff.time}</div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {project.stack.slice(0, 4).map(s => (
                                <span key={s} className="font-mono text-[8px] px-2 py-0.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.1)] text-cyan2">{s}</span>
                              ))}
                              {project.stack.length > 4 && (
                                <span className="font-mono text-[8px] text-muted">+{project.stack.length - 4} more</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[rgba(0,212,255,0.08)]">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => open(project.id)}
                                  className="font-mono text-[9px] px-2.5 py-1 border border-cyan-500/30 text-cyan hover:bg-cyan-500/10 transition-all"
                                >
                                  QUICK VIEW
                                </button>
                                <Link href={`/projects/${project.id}`}
                                  className="font-mono text-[10px] text-neon hover:text-cyan transition-colors">
                                  FULL →
                                </Link>
                              </div>
                              <div className="flex gap-2">
                                {project.github && (
                                  <a href={project.github} target="_blank" className="font-mono text-[8px] border border-[rgba(0,212,255,0.15)] text-muted px-2 py-0.5 hover:border-cyan hover:text-cyan transition-colors">GH</a>
                                )}
                                {project.demo && (
                                  <a href={project.demo} target="_blank" className="font-mono text-[8px] border border-[rgba(0,245,212,0.15)] text-neon px-2 py-0.5 hover:bg-[rgba(0,245,212,0.05)] transition-colors">LIVE</a>
                                )}
                                {project.video && (
                                  <button
                                    onClick={() => setVideoModal({ src: project.video!, title: project.title })}
                                    className="font-mono text-[8px] border border-[rgba(168,85,247,0.3)] text-purple-400 px-2 py-0.5 hover:bg-[rgba(168,85,247,0.08)] transition-colors"
                                  >
                                    ▶
                                  </button>
                                )}
                                {project.report && (
                                  <a href={project.report} target="_blank" className="font-mono text-[8px] border border-[rgba(255,170,0,0.15)] text-[#ffaa00] px-2 py-0.5 hover:bg-[rgba(255,170,0,0.05)] transition-colors">DOC</a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              TAB: CURRENTLY BUILDING
          ════════════════════════════════════════ */}
          {mainTab === 'building' && (
            <motion.div
              key="building"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Live indicator */}
              <div className="flex items-center gap-3 mb-8 font-mono text-[10px] text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                <span>These are real projects actively in development — progress is honest, not marketing.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentBuilds.map((build, i) => {
                  const config = statusConfig[build.status]
                  return (
                    <motion.div
                      key={build.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.02)] p-6 relative group hover:border-[rgba(0,212,255,0.3)] transition-colors duration-300"
                    >
                      {/* Corner accents */}
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan opacity-40 group-hover:opacity-80 transition-opacity" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan opacity-40 group-hover:opacity-80 transition-opacity" />

                      {/* Status + ETA */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`flex items-center gap-2 font-mono text-[9px] tracking-[2px] uppercase px-2 py-1 ${config.color} ${config.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${build.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                          {config.label}
                        </span>
                        {build.eta && (
                          <span className="font-mono text-[9px] text-muted tracking-[1px]">ETA: {build.eta}</span>
                        )}
                      </div>

                      <div className="font-mono text-[9px] text-purple-400 tracking-[2px] uppercase mb-2">{build.category}</div>
                      <h3 className="font-orbitron font-bold text-[#e2eaff] text-sm mb-1">{build.title}</h3>
                      <p className="font-mono text-[10px] text-muted mb-3">{build.subtitle}</p>
                      <p className="text-[13px] text-[#8899aa] leading-relaxed mb-4">{build.description}</p>

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
                              animate={{ width: `${build.progress}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-full bg-gradient-to-r from-cyan to-neon"
                              style={{ height: '2px' }}
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

              {/* Footer note */}
              <div className="mt-10 pt-6 border-t border-[rgba(0,212,255,0.08)] flex items-start gap-3">
                <span className="text-neon font-mono text-[10px] shrink-0 mt-0.5">NOTE</span>
                <p className="font-mono text-[10px] text-muted leading-relaxed">
                  All in-progress projects are being developed alongside job searching and coursework. Check{' '}
                  <a href="https://github.com/kamara1994" target="_blank" className="text-cyan hover:underline">
                    GitHub
                  </a>
                  {' '}for real commit activity.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modals */}
      {Modal}

      <AnimatePresence>
        {videoModal && (
          <VideoModal
            src={videoModal.src}
            title={videoModal.title}
            onClose={() => setVideoModal(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

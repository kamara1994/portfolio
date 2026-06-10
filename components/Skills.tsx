'use client'
// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const skillCategories = [
  {
    id: 'soc',
    title: 'Security Operations',
    icon: '🛡️',
    color: '#00d4ff',
    role: ['analyst', 'engineer'],
    skills: [
      { name: 'Splunk SIEM',       level: 90 },
      { name: 'Alert Triage',      level: 88 },
      { name: 'Incident Response', level: 85 },
      { name: 'Threat Hunting',    level: 80 },
      { name: 'Log Analysis',      level: 88 },
      { name: 'SIEM Rule Writing', level: 78 },
      { name: 'Malware Triage',    level: 75 },
      { name: 'Threat Intel',      level: 82 },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Security',
    icon: '☁️',
    color: '#00f5d4',
    role: ['engineer', 'recruiter'],
    skills: [
      { name: 'AWS GuardDuty',   level: 88 },
      { name: 'Terraform IaC',   level: 85 },
      { name: 'Lambda Remediation', level: 82 },
      { name: 'IAM Design',      level: 84 },
      { name: 'CloudTrail',      level: 86 },
      { name: 'Security Hub',    level: 80 },
      { name: 'WAF',             level: 78 },
      { name: 'CIS Benchmarks',  level: 80 },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    icon: '🤖',
    color: '#a855f7',
    role: ['engineer', 'recruiter'],
    skills: [
      { name: 'Claude LLM API',  level: 92 },
      { name: 'n8n Orchestration',level: 90 },
      { name: 'PyTorch',         level: 82 },
      { name: 'Prompt Engineering',level: 88 },
      { name: 'Pinecone DB',     level: 80 },
      { name: 'AI Workflow',     level: 87 },
      { name: 'Gemini Flash',    level: 78 },
      { name: 'RAG Pipelines',   level: 76 },
    ],
  },
  {
    id: 'network',
    title: 'Network Security',
    icon: '🔗',
    color: '#38bdf8',
    role: ['analyst', 'engineer'],
    skills: [
      { name: 'Palo Alto NGFW', level: 85 },
      { name: 'Zeek/Suricata',  level: 82 },
      { name: 'Cisco IOS',      level: 88 },
      { name: 'IDS/IPS',        level: 84 },
      { name: 'TCP/IP',         level: 90 },
      { name: 'Wireshark',      level: 86 },
      { name: 'VPN Config',     level: 78 },
      { name: 'Scapy',          level: 80 },
    ],
  },
  {
    id: 'pentest',
    title: 'Penetration Testing',
    icon: '🎯',
    color: '#ef4444',
    role: ['analyst', 'engineer'],
    skills: [
      { name: 'Kali Linux',      level: 85 },
      { name: 'Metasploit',      level: 80 },
      { name: 'Burp Suite',      level: 82 },
      { name: 'Nmap',            level: 88 },
      { name: 'Nessus',          level: 78 },
      { name: 'OSINT',           level: 84 },
      { name: 'Vuln Assessment', level: 85 },
      { name: 'Hashcat',         level: 75 },
    ],
  },
  {
    id: 'dev',
    title: 'Scripting & Dev',
    icon: '💻',
    color: '#f59e0b',
    role: ['engineer'],
    skills: [
      { name: 'Python',           level: 90 },
      { name: 'Bash/PowerShell',  level: 85 },
      { name: 'REST APIs',        level: 88 },
      { name: 'TypeScript',       level: 82 },
      { name: 'Next.js/React',    level: 85 },
      { name: 'Docker',           level: 78 },
      { name: 'Flask',            level: 80 },
      { name: 'Terraform',        level: 82 },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    icon: '📋',
    color: '#818cf8',
    role: ['analyst', 'engineer', 'recruiter'],
    skills: [
      { name: 'MITRE ATT&CK', level: 90 },
      { name: 'OWASP Top 10', level: 86 },
      { name: 'NIST CSF',     level: 82 },
      { name: 'Kill Chain',   level: 85 },
      { name: 'Zero Trust',   level: 80 },
      { name: 'CIS Benchmarks',level: 82 },
      { name: 'ISO 27001',    level: 72 },
    ],
  },
]

/* ── Radar Chart ── */
function RadarChart({ category }: { category: typeof skillCategories[0] }) {
  const skills = category.skills.slice(0, 8)
  const n      = skills.length
  const CX = 150, CY = 150, R = 105
  const color  = category.color

  const angle  = (i: number) => (i * 2 * Math.PI / n) - Math.PI / 2
  const pt     = (i: number, lvl: number) => ({
    x: CX + (lvl / 100) * R * Math.cos(angle(i)),
    y: CY + (lvl / 100) * R * Math.sin(angle(i)),
  })
  const gridPoly = (scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = { x: CX + scale * R * Math.cos(angle(i)), y: CY + scale * R * Math.sin(angle(i)) }
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ') + 'Z'

  const dataPoly = skills
    .map((s, i) => { const p = pt(i, s.level); return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}` })
    .join(' ') + 'Z'

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[260px] mx-auto overflow-visible" aria-hidden>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((s, ri) => (
        <path key={ri} d={gridPoly(s)} fill="none"
          stroke={ri === 3 ? `${color}28` : 'rgba(0,212,255,0.07)'}
          strokeWidth={ri === 3 ? 1.5 : 1}
          strokeDasharray={ri < 3 ? '3 4' : '0'} />
      ))}
      {/* Ring labels */}
      {[25, 50, 75].map(lvl => {
        const p = { x: CX + (lvl / 100) * R * Math.cos(angle(0) + 0.18), y: CY + (lvl / 100) * R * Math.sin(angle(0) + 0.18) }
        return <text key={lvl} x={p.x} y={p.y} fontSize="6.5" fill="rgba(0,212,255,0.3)" fontFamily="monospace" dominantBaseline="middle">{lvl}%</text>
      })}
      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const p = { x: CX + R * Math.cos(angle(i)), y: CY + R * Math.sin(angle(i)) }
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="rgba(0,212,255,0.09)" strokeWidth="1" />
      })}
      {/* Data polygon */}
      <motion.path
        key={category.id}
        d={dataPoly}
        fill={`${color}20`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ transformOrigin: `${CX}px ${CY}px`, filter: `drop-shadow(0 0 8px ${color}55)` }}
      />
      {/* Vertex dots */}
      {skills.map((s, i) => {
        const p = pt(i, s.level)
        return (
          <motion.circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 3.5, opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.04, duration: 0.25 }}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        )
      })}
      {/* Labels */}
      {skills.map((s, i) => {
        const a  = angle(i)
        const lx = CX + (R + 25) * Math.cos(a)
        const ly = CY + (R + 25) * Math.sin(a)
        const anchor = Math.cos(a) > 0.15 ? 'start' : Math.cos(a) < -0.15 ? 'end' : 'middle'
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
            fill={color} fontSize="8" fontFamily="Share Tech Mono, monospace" opacity="0.8">
            {s.name.split(' ')[0]}
          </text>
        )
      })}
      {/* Center */}
      <circle cx={CX} cy={CY} r={2.5} fill={color} opacity="0.5" />
    </svg>
  )
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('soc')
  const current = skillCategories.find(c => c.id === activeCategory)!

  return (
    <section id="skills" className="relative z-10 py-24 px-6 bg-[rgba(5,14,36,0.4)]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Technical Arsenal" title="Core " accent="Skills" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Category sidebar ── */}
          <div className="lg:col-span-1">
            <div className="font-mono text-muted tracking-[2px] uppercase mb-3" style={{ fontSize: 9 }}>
              Categories
            </div>
            <div className="space-y-1">
              {skillCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 border transition-all duration-200 relative overflow-hidden"
                  style={{
                    borderColor: activeCategory === cat.id ? `${cat.color}50` : 'rgba(0,212,255,0.08)',
                    background:  activeCategory === cat.id ? `${cat.color}09` : 'transparent',
                  }}
                >
                  {/* Active left accent */}
                  {activeCategory === cat.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                      style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
                  )}
                  <span className="text-base shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-mono leading-tight truncate"
                      style={{ fontSize: 10, color: activeCategory === cat.id ? cat.color : '#8899bb' }}
                    >
                      {cat.title}
                    </div>
                    <div className="font-mono text-muted mt-0.5" style={{ fontSize: 8 }}>
                      {cat.skills.length} skills
                    </div>
                  </div>
                  {activeCategory === cat.id && (
                    <span className="font-mono shrink-0" style={{ fontSize: 10, color: cat.color }}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Skills panel ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center justify-between mb-5 pb-4"
                  style={{ borderBottom: `1px solid ${current.color}20` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{current.icon}</span>
                    <div>
                      <div className="font-orbitron text-base font-bold text-[#e2eaff]">{current.title}</div>
                      <div className="font-mono text-muted" style={{ fontSize: 9 }}>
                        {current.skills.length} skills · hands-on experience
                      </div>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ background: current.color, boxShadow: `0 0 12px ${current.color}` }} />
                </div>

                {/* Radar chart + stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 items-center">
                  {/* Radar */}
                  <div
                    className="p-4 border relative overflow-hidden"
                    style={{ borderColor: `${current.color}18`, background: `${current.color}04` }}
                  >
                    <div className="font-mono text-muted tracking-[2px] uppercase mb-3" style={{ fontSize: 8 }}>
                      Skill Profile
                    </div>
                    <RadarChart category={current} />
                    {/* Corner accents */}
                    <span className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: `${current.color}40` }} />
                    <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: `${current.color}40` }} />
                  </div>

                  {/* Quick stats */}
                  <div className="space-y-3">
                    {[
                      { label: 'Top Skill',    val: current.skills.sort((a, b) => b.level - a.level)[0].name },
                      { label: 'Avg Level',    val: Math.round(current.skills.reduce((s, k) => s + k.level, 0) / current.skills.length) + '%' },
                      { label: 'Proficient',   val: current.skills.filter(s => s.level >= 85).length + ' skills' },
                      { label: 'Experienced',  val: current.skills.filter(s => s.level >= 75 && s.level < 85).length + ' skills' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex justify-between items-center px-4 py-3 border"
                        style={{ borderColor: `${current.color}18`, background: `${current.color}05` }}
                      >
                        <span className="font-mono text-muted" style={{ fontSize: 9 }}>{stat.label}</span>
                        <span className="font-mono font-bold" style={{ fontSize: 11, color: current.color }}>
                          {stat.val}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skill cells grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-4 py-3 border transition-all duration-200 group relative overflow-hidden"
                      style={{
                        borderColor: `${current.color}1e`,
                        background:  `${current.color}04`,
                      }}
                    >
                      {/* Hover shimmer */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${current.color}09, transparent)` }}
                      />
                      <div className="flex items-center justify-between mb-2 relative">
                        <span className="font-mono text-[#b0c4d8] group-hover:text-white transition-colors" style={{ fontSize: 11 }}>
                          {skill.name}
                        </span>
                        <span
                          className="font-mono font-bold px-1.5 py-0.5"
                          style={{
                            fontSize: 8,
                            color: current.color,
                            background: `${current.color}18`,
                            border: `1px solid ${current.color}30`,
                          }}
                        >
                          {skill.level >= 85 ? 'PROFICIENT' : skill.level >= 75 ? 'EXPERIENCED' : 'FAMILIAR'}
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div
                          key={`${current.id}-${skill.name}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 0.75, delay: i * 0.04, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${current.color}70, ${current.color})` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 relative">
                        <span className="font-mono text-muted" style={{ fontSize: 7 }}>0%</span>
                        <span className="font-mono" style={{ fontSize: 7, color: current.color }}>{skill.level}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer note */}
                <div
                  className="mt-5 p-3 border"
                  style={{ borderColor: 'rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.02)' }}
                >
                  <p className="font-mono text-muted leading-relaxed" style={{ fontSize: 9 }}>
                    Proficiency based on hands-on project experience and lab work.
                    All skills applied in real projects — not just coursework.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

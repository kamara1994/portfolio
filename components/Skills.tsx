'use client'
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
      { name: 'Splunk SIEM', level: 90 },
      { name: 'Alert Triage', level: 88 },
      { name: 'Incident Response', level: 85 },
      { name: 'Threat Hunting', level: 80 },
      { name: 'Log Analysis', level: 88 },
      { name: 'SIEM Rule Writing', level: 78 },
      { name: 'Malware Triage', level: 75 },
      { name: 'Threat Intelligence', level: 82 },
      { name: 'Network Forensics', level: 76 },
      { name: 'Packet Analysis', level: 80 },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Security',
    icon: '☁️',
    color: '#00f5d4',
    role: ['engineer', 'recruiter'],
    skills: [
      { name: 'AWS GuardDuty', level: 88 },
      { name: 'Terraform IaC', level: 85 },
      { name: 'Lambda Remediation', level: 82 },
      { name: 'IAM Policy Design', level: 84 },
      { name: 'CloudTrail', level: 86 },
      { name: 'Security Hub', level: 80 },
      { name: 'WAF', level: 78 },
      { name: 'CIS Benchmarks', level: 80 },
      { name: 'S3 Security', level: 82 },
      { name: 'VPC Security', level: 78 },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    icon: '🤖',
    color: '#a855f7',
    role: ['engineer', 'recruiter'],
    skills: [
      { name: 'Claude LLM API', level: 92 },
      { name: 'n8n Orchestration', level: 90 },
      { name: 'PyTorch', level: 82 },
      { name: 'Prompt Engineering', level: 88 },
      { name: 'Pinecone Vector DB', level: 80 },
      { name: 'AI Workflow Design', level: 87 },
      { name: 'Gemini Flash', level: 78 },
      { name: 'RAG Pipelines', level: 76 },
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
      { name: 'Zeek / Suricata', level: 82 },
      { name: 'Cisco IOS', level: 88 },
      { name: 'IDS/IPS Systems', level: 84 },
      { name: 'Scapy', level: 80 },
      { name: 'TCP/IP Protocols', level: 90 },
      { name: 'Wireshark', level: 86 },
      { name: 'VPN Config', level: 78 },
    ],
  },
  {
    id: 'pentest',
    title: 'Penetration Testing',
    icon: '🎯',
    color: '#ef4444',
    role: ['analyst', 'engineer'],
    skills: [
      { name: 'Kali Linux', level: 85 },
      { name: 'Metasploit', level: 80 },
      { name: 'Burp Suite', level: 82 },
      { name: 'Nmap', level: 88 },
      { name: 'Nessus', level: 78 },
      { name: 'OSINT Techniques', level: 84 },
      { name: 'Vulnerability Assessment', level: 85 },
      { name: 'Hashcat', level: 75 },
    ],
  },
  {
    id: 'dev',
    title: 'Scripting & Dev',
    icon: '💻',
    color: '#f59e0b',
    role: ['engineer'],
    skills: [
      { name: 'Python', level: 90 },
      { name: 'Bash / PowerShell', level: 85 },
      { name: 'REST APIs', level: 88 },
      { name: 'TypeScript', level: 82 },
      { name: 'Next.js / React', level: 85 },
      { name: 'Docker', level: 78 },
      { name: 'Flask', level: 80 },
      { name: 'Terraform', level: 82 },
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
      { name: 'NIST CSF', level: 82 },
      { name: 'Kill Chain', level: 85 },
      { name: 'Zero Trust', level: 80 },
      { name: 'CIS Benchmarks', level: 82 },
      { name: 'ISO 27001 Basics', level: 72 },
    ],
  },
]

function ProficiencyBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1 bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <span className="font-mono text-[8px] text-muted w-7 text-right">{level}%</span>
    </div>
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

          {/* Category sidebar */}
          <div className="lg:col-span-1">
            <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-3">Categories</div>
            <div className="space-y-1">
              {skillCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 border transition-all duration-200"
                  style={{
                    borderColor: activeCategory === cat.id ? `${cat.color}50` : 'rgba(0,212,255,0.08)',
                    background: activeCategory === cat.id ? `${cat.color}08` : 'transparent',
                  }}
                >
                  <span className="text-base shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] leading-tight truncate"
                      style={{ color: activeCategory === cat.id ? cat.color : '#8899bb' }}>
                      {cat.title}
                    </div>
                    <div className="font-mono text-[8px] text-muted mt-0.5">{cat.skills.length} skills</div>
                  </div>
                  {activeCategory === cat.id && (
                    <span className="font-mono text-[10px] shrink-0" style={{ color: cat.color }}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Skills panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-[rgba(0,212,255,0.1)]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{current.icon}</span>
                    <div>
                      <div className="font-orbitron text-base font-bold text-[#e2eaff]">{current.title}</div>
                      <div className="font-mono text-[9px] text-muted">{current.skills.length} skills · hands-on experience</div>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ background: current.color, boxShadow: `0 0 10px ${current.color}` }} />
                </div>

                {/* Skills grid with bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {current.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 border border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-[#b0c4d8]">{skill.name}</span>
                        <span className="font-mono text-[8px] px-1.5 py-0.5 border text-[8px]"
                          style={{ color: current.color, borderColor: `${current.color}30` }}>
                          {skill.level >= 85 ? 'PROFICIENT' : skill.level >= 75 ? 'EXPERIENCED' : 'FAMILIAR'}
                        </span>
                      </div>
                      <ProficiencyBar level={skill.level} color={current.color} />
                    </motion.div>
                  ))}
                </div>

                {/* Bottom note */}
                <div className="mt-5 p-3 border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]">
                  <p className="font-mono text-[9px] text-muted">
                    Proficiency based on hands-on project experience and lab work. All skills applied in real projects — not just coursework.
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

'use client'
// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { projects } from '@/data/projects'
import { useProjectModal } from '@/components/ProjectModal'
import ProjectSimulation from '@/components/ProjectSimulation'

const SIM_PROJECTS = new Set(['blue-soc-p8', 'fortress-v2', 'blue-x'])

/* ──────────────────────────── DATA ──────────────────────────── */
const currentBuilds = [
  { id:'incident-replay-lab',  title:'Incident Replay Lab',         subtitle:'Interactive SOC Investigation',  status:'in-progress', progress:35, category:'AI Security',    description:'Walk through real SOC incidents step-by-step — phishing analysis, IOC extraction, MITRE ATT&CK mapping.',     stack:['Next.js','TypeScript','Framer Motion','MITRE ATT&CK'], eta:'Q2 2026' },
  { id:'blue-research-lab',    title:'BLUE Research Lab',           subtitle:'Experimental Security Sandbox',  status:'in-progress', progress:20, category:'Research',       description:'Experimental zone — SOC terminal, prompt injection defense lab, WASM log parser, local AI analysis.',         stack:['WebAssembly','Rust','WebGPU','Next.js'],              eta:'Q3 2026' },
  { id:'aws-security-v2',      title:'AWS Security Automation v2',  subtitle:'Cloud Incident Response Pipeline',status:'in-progress',progress:15, category:'Cloud Security', description:'Expanding FORTRESS v2 with Step Functions, analyst-approved Lambda remediation.',                              stack:['AWS','Terraform','Step Functions','Lambda'],          eta:'Q3 2026' },
  { id:'blue-career-v2',       title:'BLUE Career Intelligence v2', subtitle:'Job Intelligence Pipeline',      status:'in-progress', progress:60, category:'AI Automation',  description:'Upgraded job intelligence pipeline with improved fit scoring and application tracking.',                       stack:['Python','Claude API','n8n','PostgreSQL'],             eta:'Active'  },
  { id:'soc-terminal',         title:'SOC Analyst Terminal',        subtitle:'Interactive CLI Interface',      status:'planned',                  category:'Portfolio',      description:'Interactive terminal with real SOC commands — incident replay, splunk-query, mitre-map.',                      stack:['TypeScript','Next.js','WebAssembly'],                 eta:'Q3 2026' },
]

const DIFFICULTY = {
  'blue-soc-p8':{complexity:9,impact:10,time:'3 months'},
  'fortress-v2':{complexity:9,impact:9,time:'6 weeks'},
  'blue-x':{complexity:10,impact:10,time:'4 weeks'},
  'blue-v3':{complexity:8,impact:9,time:'2 months'},
  'enterprise-networking':{complexity:7,impact:8,time:'4 months'},
  'threat-intel-dashboard':{complexity:6,impact:7,time:'3 weeks'},
  'cve-scanner':{complexity:5,impact:7,time:'2 weeks'},
  'python-ids':{complexity:5,impact:6,time:'2 weeks'},
  'security-automation-toolkit':{complexity:4,impact:6,time:'3 weeks'},
  'elitecom':{complexity:6,impact:7,time:'6 weeks'},
  'pandie-foundation':{complexity:5,impact:6,time:'4 weeks'},
}

const projectStatusLabels = {
  'lab-validated':  {label:'LAB-VALIDATED', color:'#00f5d4'},
  'live-demo':      {label:'LIVE DEMO',      color:'#00d4ff'},
  'case-study':     {label:'CASE STUDY',     color:'#818cf8'},
  'in-development': {label:'IN DEV',         color:'#ffaa00'},
  'verified':       {label:'VERIFIED',       color:'#00f5d4'},
}

function DiffBar({value, color}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length:10}).map((_,i)=>(
        <div key={i} className="h-1.5 w-3 rounded-sm" style={{background: i<value ? color : 'rgba(255,255,255,0.05)'}} />
      ))}
    </div>
  )
}

function VideoModal({src,title,onClose}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(2,8,24,0.95)] backdrop-blur-sm"/>
      <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}}
        className="relative z-10 w-full max-w-4xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-orbitron text-lg font-bold text-[#e2eaff]">{title}</div>
          <button onClick={onClose} className="font-mono text-[11px] text-muted hover:text-cyan border border-[rgba(0,212,255,0.2)] px-3 py-1.5">ESC</button>
        </div>
        <video src={src} controls autoPlay className="w-full max-h-[60vh] bg-black border border-[rgba(0,212,255,0.2)]"/>
      </motion.div>
    </motion.div>
  )
}

/* ════════════════ FLOATING GLASS TAB ════════════════ */
function GlassTab({ tab, isActive, restTilt, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={false}
      animate={{
        rotateY: isActive ? 0 : restTilt,
        rotateX: isActive ? 0 : 4,
        scale:   isActive ? 1.04 : 1,
        z:       isActive ? 30 : 0,
      }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.12, z: 70 }}
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        background: isActive
          ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.18) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: `1.5px solid ${isActive ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.20)'}`,
        borderRadius: 18,
        padding: '18px 26px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        outline: 'none',
        color: '#fff',
        boxShadow: isActive
          ? `inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.04), 0 26px 50px rgba(0,0,0,0.55), 0 0 70px ${tab.glow}55`
          : `inset 0 1.5px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(255,255,255,0.04), 0 18px 40px rgba(0,0,0,0.5), 0 0 36px ${tab.glow}22`,
      }}
    >
      {/* Top edge highlight strip — the bright "rim" from the reference */}
      <div style={{
        position: 'absolute', top: 0, left: '12%', right: '12%', height: 1,
        background: `linear-gradient(90deg, transparent, ${isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'}, transparent)`,
        pointerEvents: 'none', borderRadius: 1,
      }} />

      {/* Icon block */}
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: `linear-gradient(135deg, ${tab.color}, ${tab.glow})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: '#fff', fontWeight: 900, flexShrink: 0,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 14px rgba(0,0,0,0.4), 0 0 14px ${tab.color}55`,
      }}>
        {tab.icon}
      </div>

      {/* Label block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, textAlign: 'left' }}>
        <span className="font-orbitron" style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: 2.4, color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>
          {tab.label}
        </span>
        <span className="font-mono" style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, lineHeight: 1 }}>
          {tab.sub}
        </span>
      </div>

      {/* Count badge */}
      <span className="font-mono" style={{
        fontSize: 10, padding: '4px 9px', borderRadius: 6, marginLeft: 4,
        background: 'rgba(255,255,255,0.10)', color: '#fff',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
      }}>
        {tab.count}
      </span>

      {/* Rainbow ribbon (Currently Building only) */}
      {tab.rainbow && (
        <div style={{ position: 'absolute', bottom: 0, left: 14, right: 14, height: 2.5, overflow: 'hidden', borderRadius: 2 }}>
          <motion.div
            style={{ height:'100%', width:'200%', background:'linear-gradient(90deg,#ef4444,#f97316,#f59e0b,#84cc16,#00f5d4,#00d4ff,#818cf8,#a855f7,#ef4444,#f97316,#f59e0b,#00f5d4)' }}
            animate={{ x:['-50%','0%'] }} transition={{ duration:3, repeat:Infinity, ease:'linear' }}
          />
        </div>
      )}

      {/* Active dot */}
      {isActive && (
        <span style={{ position: 'absolute', top: 10, right: 12, width: 6, height: 6, borderRadius:'50%',
          background: tab.color, boxShadow: `0 0 10px ${tab.color}`, animation:'pfBlink 1.6s ease-in-out infinite' }} />
      )}
    </motion.button>
  )
}

/* ════════════════ FLOATING GLASS CHIP ════════════════ */
function GlassChip({ label, active, restTilt, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={false}
      animate={{
        rotateY: active ? 0 : restTilt,
        rotateX: active ? 0 : 2,
        scale:   active ? 1.06 : 1,
        y:       active ? -3 : 0,
      }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.12, y: -6, z: 40 }}
      transition={{ type:'spring', stiffness: 280, damping: 22 }}
      className="font-mono uppercase"
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        background: active
          ? 'linear-gradient(135deg, rgba(0,212,255,0.22) 0%, rgba(0,212,255,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.15) 100%)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        border: `1.2px solid ${active ? 'rgba(0,212,255,0.55)' : 'rgba(255,255,255,0.18)'}`,
        borderRadius: 11,
        padding: '8px 16px',
        fontSize: 9,
        letterSpacing: 2,
        color: active ? '#00d4ff' : 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: active
          ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 10px 24px rgba(0,0,0,0.4), 0 0 22px rgba(0,212,255,0.35)'
          : 'inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top bevel */}
      <div style={{
        position:'absolute', top:0, left:'18%', right:'18%', height:1,
        background:`linear-gradient(90deg,transparent,${active?'rgba(0,212,255,0.7)':'rgba(255,255,255,0.5)'},transparent)`,
        pointerEvents:'none', borderRadius:1,
      }}/>
      {label}
    </motion.button>
  )
}

/* ════════════════ MAIN ════════════════ */
export default function ProjectsFilter() {
  const [mainTab, setMainTab]         = useState('built')
  const [activeCategory, setCategory] = useState('All')
  const [videoModal, setVideoModal]   = useState(null)
  const [simProject, setSimProject]   = useState(null)
  const {open, Modal}                 = useProjectModal()

  const categories = ['All', ...Array.from(new Set(projects.map(p=>p.category)))]
  const filtered   = activeCategory==='All' ? projects : projects.filter(p=>p.category===activeCategory)

  const tabs = [
    { id:'built',    label:'Built',              sub:'production projects', icon:'▦', color:'#00d4ff', glow:'#818cf8', count:projects.length,      rainbow:false },
    { id:'building', label:'Currently Building', sub:'active development',  icon:'⚡', color:'#00f5d4', glow:'#a855f7', count:currentBuilds.length, rainbow:true  },
  ]

  return (
    <section id="projects" className="px-6 py-20 relative overflow-hidden">
      {/* Soft ambient purple/cyan halos behind tabs — gives the frosted blur something to bite into */}
      <div className="absolute pointer-events-none" style={{ top:120, left:'18%', width:340, height:240, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(168,85,247,0.18), transparent 70%)', filter:'blur(40px)' }}/>
      <div className="absolute pointer-events-none" style={{ top:90, right:'14%', width:300, height:220, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(0,212,255,0.12), transparent 70%)', filter:'blur(50px)' }}/>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">Portfolio</div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-10">
          Featured <span className="text-cyan">Projects</span>
        </h2>

        {/* ── Floating glass tabs ── */}
        <div style={{ perspective: 1400, display: 'flex', flexWrap: 'wrap', gap: 22, marginBottom: 44, paddingTop: 8, paddingBottom: 8 }}>
          {tabs.map((tab, idx) => (
            <GlassTab key={tab.id}
              tab={tab}
              isActive={mainTab === tab.id}
              restTilt={idx === 0 ? -7 : 7}
              onClick={() => setMainTab(tab.id)}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ BUILT ══ */}
          {mainTab==='built' && (
            <motion.div key="built" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:.22}}>

              {/* Floating glass chips */}
              <div style={{ perspective: 900, display:'flex', flexWrap:'wrap', gap:12, marginBottom:38, alignItems:'center' }}>
                {categories.map((cat,i) => (
                  <GlassChip key={cat}
                    label={cat}
                    active={activeCategory === cat}
                    restTilt={i % 2 === 0 ? -4 : 4}
                    onClick={() => setCategory(cat)}
                  />
                ))}
                <span className="font-mono text-muted ml-1" style={{fontSize:9}}>{filtered.length} projects</span>
              </div>

              {/* Project grid with subtle 3D tilt on each card */}
              <div style={{ perspective: 1500 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((project, i) => {
                      const diff       = DIFFICULTY[project.id]
                      const statusInfo = project.status ? projectStatusLabels[project.status] : null
                      const hasSim     = SIM_PROJECTS.has(project.id)
                      const cardTilt   = i % 3 === 0 ? -3 : i % 3 === 2 ? 3 : 0
                      return (
                        <motion.div key={project.id} layout
                          initial={{opacity:0, y:20}}
                          animate={{opacity:1, y:0, rotateY: cardTilt, rotateX: 1.5}}
                          exit={{opacity:0, scale:.95}}
                          whileHover={{ rotateY: 0, rotateX: 0, scale: 1.035, z: 50 }}
                          transition={{ delay: i*.04, type:'spring', stiffness: 220, damping: 24 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="group relative overflow-hidden h-full"
                            style={{
                              backdropFilter:'blur(16px) saturate(180%)', WebkitBackdropFilter:'blur(16px) saturate(180%)',
                              background:'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.45) 100%)',
                              border:'1.2px solid rgba(255,255,255,0.14)',
                              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 36px rgba(0,0,0,0.45), 0 0 30px rgba(168,85,247,0.08)',
                              borderRadius:14,
                            }}>
                            {/* top bevel */}
                            <div style={{ position:'absolute', top:0, left:'12%', right:'12%', height:1,
                              background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', pointerEvents:'none' }}/>

                            {/* Screenshot */}
                            <div className="relative w-full h-52 overflow-hidden" style={{borderRadius:'14px 14px 0 0'}}>
                              {project.screenshot
                                ? <img src={project.screenshot} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                : <div className="w-full h-full flex items-center justify-center" style={{background:'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(129,140,248,0.05))'}}>
                                    <div className="font-orbitron text-6xl font-black text-[rgba(0,212,255,0.08)]">{project.num}</div>
                                  </div>
                              }
                              <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.8),transparent)'}}/>
                              {project.video && (
                                <button onClick={()=>setVideoModal({src:project.video,title:project.title})}
                                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full border-2 border-cyan flex items-center justify-center bg-[rgba(0,212,255,0.15)]">
                                      <span className="text-cyan text-xl ml-1">▶</span>
                                    </div>
                                  </div>
                                </button>
                              )}
                              <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap justify-end">
                                {project.featured && <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,245,212,0.5)] text-neon bg-black/70 backdrop-blur-sm">FLAGSHIP</span>}
                                {statusInfo && <span className="font-mono text-[8px] px-2 py-1 border bg-black/70 backdrop-blur-sm" style={{borderColor:`${statusInfo.color}50`,color:statusInfo.color}}>{statusInfo.label}</span>}
                                {project.demo && <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,212,255,0.5)] text-cyan bg-black/70 backdrop-blur-sm flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-cyan animate-pulse"/>LIVE</span>}
                                {hasSim && <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(239,68,68,0.6)] text-[#ef4444] bg-black/70 backdrop-blur-sm flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ef4444] animate-pulse"/>SIMULATE</span>}
                              </div>
                              <div className="absolute bottom-3 left-3 font-orbitron text-2xl font-black text-[rgba(0,212,255,0.2)]">{project.num}</div>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                              <div className="font-mono text-[9px] text-cyan tracking-[2px] uppercase mb-2">{project.category}</div>
                              <h3 className="font-orbitron text-base font-bold text-[#e2eaff] mb-1 group-hover:text-cyan transition-colors leading-tight">{project.title}</h3>
                              <p className="font-mono text-[10px] text-muted mb-4 leading-relaxed line-clamp-2">{project.subtitle}</p>
                              {diff && (
                                <div className="space-y-2 mb-4">
                                  <div><div className="font-mono text-[8px] text-muted tracking-wider mb-1">COMPLEXITY</div><DiffBar value={diff.complexity} color="#00d4ff"/></div>
                                  <div><div className="font-mono text-[8px] text-muted tracking-wider mb-1">IMPACT</div><DiffBar value={diff.impact} color="#00f5d4"/></div>
                                  <div className="font-mono text-[8px] text-[rgba(0,212,255,0.4)]">⏱ {diff.time}</div>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {project.stack.slice(0,4).map(s=><span key={s} className="font-mono text-[8px] px-2 py-0.5 bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.1)] text-cyan2">{s}</span>)}
                                {project.stack.length>4 && <span className="font-mono text-[8px] text-muted">+{project.stack.length-4}</span>}
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {hasSim && (
                                    <button onClick={()=>setSimProject(project.id)}
                                      className="font-mono text-[9px] px-3 py-1.5 font-black tracking-[1px] uppercase transition-all"
                                      style={{background:'rgba(239,68,68,0.12)',border:'1.5px solid rgba(239,68,68,0.5)',color:'#ef4444',borderRadius:4}}>
                                      ⚡ SIMULATE
                                    </button>
                                  )}
                                  <button onClick={()=>open(project.id)} className="font-mono text-[9px] px-2.5 py-1 border border-cyan/30 text-cyan hover:bg-cyan/10 transition-all">QUICK VIEW</button>
                                  <Link href={`/projects/${project.id}`} className="font-mono text-[10px] text-neon hover:text-cyan transition-colors">FULL →</Link>
                                </div>
                                <div className="flex gap-2">
                                  {project.github && <a href={project.github} target="_blank" className="font-mono text-[8px] border border-[rgba(0,212,255,0.15)] text-muted px-2 py-0.5 hover:border-cyan hover:text-cyan transition-colors">GH</a>}
                                  {project.demo   && <a href={project.demo}   target="_blank" className="font-mono text-[8px] border border-[rgba(0,245,212,0.15)] text-neon px-2 py-0.5">LIVE</a>}
                                  {project.video  && <button onClick={()=>setVideoModal({src:project.video,title:project.title})} className="font-mono text-[8px] border border-[rgba(168,85,247,0.3)] text-purple-400 px-2 py-0.5">▶</button>}
                                  {project.report && <a href={project.report} target="_blank" className="font-mono text-[8px] border border-[rgba(255,170,0,0.15)] text-[#ffaa00] px-2 py-0.5">DOC</a>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ BUILDING ══ */}
          {mainTab==='building' && (
            <motion.div key="building" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:.22}}>
              <div className="flex items-center gap-3 mb-8 font-mono text-[10px] text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"/>
                Real projects actively in development — progress is honest, not marketing.
              </div>
              <div style={{ perspective: 1400 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentBuilds.map((build,i) => {
                    const cardTilt = i % 3 === 0 ? -3 : i % 3 === 2 ? 3 : 0
                    return (
                      <motion.div key={build.id}
                        initial={{opacity:0,y:20}}
                        animate={{opacity:1,y:0,rotateY:cardTilt,rotateX:1.5}}
                        whileHover={{rotateY:0,rotateX:0,scale:1.035,z:50}}
                        transition={{delay:i*.07, type:'spring', stiffness:220, damping:24}}
                        style={{transformStyle:'preserve-3d'}}
                      >
                        <div className="relative p-6 overflow-hidden group h-full"
                          style={{
                            backdropFilter:'blur(16px) saturate(180%)', WebkitBackdropFilter:'blur(16px) saturate(180%)',
                            background:'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.45))',
                            border:'1.2px solid rgba(255,255,255,0.14)',
                            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 36px rgba(0,0,0,0.4)',
                            borderRadius:14,
                          }}>
                          <div style={{ position:'absolute', top:0, left:'12%', right:'12%', height:1,
                            background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', pointerEvents:'none' }}/>
                          <div className="flex justify-between mb-4">
                            <span className="font-mono text-[8px] tracking-[2px] uppercase text-cyan bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] px-2 py-1">
                              {build.status.toUpperCase().replace('-',' ')}
                            </span>
                            {build.eta && <span className="font-mono text-[9px] text-muted">{build.eta}</span>}
                          </div>
                          <div className="font-orbitron text-sm font-bold text-[#e2eaff] mb-1">{build.title}</div>
                          <div className="font-mono text-[10px] text-muted mb-3">{build.subtitle}</div>
                          <p className="text-[13px] text-[#8899aa] leading-relaxed mb-4">{build.description}</p>
                          {build.progress!==undefined && (
                            <div className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span className="font-mono text-[9px] text-muted uppercase">Progress</span>
                                <span className="font-mono text-[9px] text-cyan">{build.progress}%</span>
                              </div>
                              <div className="h-[2px] bg-[rgba(0,212,255,0.08)]">
                                <motion.div initial={{width:0}} animate={{width:`${build.progress}%`}} transition={{duration:1,delay:i*.1}} className="h-full bg-gradient-to-r from-cyan to-neon"/>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {build.stack.map(s=><span key={s} className="font-mono text-[9px] px-2 py-0.5 border border-[rgba(0,212,255,0.12)] text-muted">{s}</span>)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {Modal}
      <AnimatePresence>
        {videoModal && <VideoModal src={videoModal.src} title={videoModal.title} onClose={()=>setVideoModal(null)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {simProject && <ProjectSimulation projectId={simProject} onClose={()=>setSimProject(null)}/>}
      </AnimatePresence>

      <style>{`
        @keyframes pfBlink { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>
    </section>
  )
}

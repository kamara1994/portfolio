'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { projects } from '@/data/projects'
import { useProjectModal } from '@/components/ProjectModal'

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

export default function ProjectsFilter() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { open, Modal } = useProjectModal()
  const availableCategories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]
  const filtered = activeCategory === 'All' ? projects : projects.filter(p => p.category === activeCategory)

  return (
    <section id="projects" className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">Portfolio</div>
        <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-4">Featured <span className="text-cyan">Projects</span></h2>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
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

              return (
                <motion.div key={project.id} layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}>
                  <div className="group relative overflow-hidden rounded-lg border border-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.3)] transition-all duration-300 h-full"
                    style={{ background: '#010c1e' }}>

                    {/* Screenshot */}
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

                      <div className="absolute top-3 right-3 flex gap-2">
                        {project.featured && (
                          <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,245,212,0.5)] text-neon bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
                            FLAGSHIP
                          </span>
                        )}
                        {project.demo && (
                          <span className="font-mono text-[8px] px-2 py-1 border border-[rgba(0,212,255,0.5)] text-cyan bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-cyan animate-pulse" />
                            LIVE
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
                            <span className="font-mono text-[8px] border border-[rgba(0,212,255,0.15)] text-muted px-2 py-0.5">GH</span>
                          )}
                          {project.demo && (
                            <span className="font-mono text-[8px] border border-[rgba(0,245,212,0.15)] text-neon px-2 py-0.5">LIVE</span>
                          )}
                          {project.report && (
                            <span className="font-mono text-[8px] border border-[rgba(255,170,0,0.15)] text-[#ffaa00] px-2 py-0.5">DOC</span>
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
      </div>

      {/* Project Modal */}
      {Modal}
    </section>
  )
}
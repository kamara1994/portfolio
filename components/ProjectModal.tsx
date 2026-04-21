'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from '@/data/projects'

interface Props {
  projectId: string
  onClose: () => void
}

function ProjectModal({ projectId, onClose }: Props) {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(2,8,24,0.95)] backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="glass-card p-6 mb-2 sticky top-0 z-10" style={{ backdropFilter: 'blur(20px)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[9px] tracking-[3px] uppercase px-2 py-1 border border-cyan-500/30 text-cyan">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="font-mono text-[9px] tracking-[2px] uppercase px-2 py-1 border border-neon/30 text-neon">
                    ★ FLAGSHIP
                  </span>
                )}
              </div>
              <h2 className="font-orbitron text-2xl font-black text-[#e2eaff]">{project.title}</h2>
              <p className="font-mono text-sm text-cyan mt-1">{project.subtitle}</p>
            </div>
            <button onClick={onClose}
              className="font-mono text-[11px] text-muted hover:text-cyan border border-[rgba(0,212,255,0.2)] px-3 py-1.5 hover:border-cyan transition-colors">
              ESC
            </button>
          </div>
        </div>

        {/* Screenshot */}
        {project.screenshot && (
          <div className="glass-card overflow-hidden mb-2">
            <div className="terminal-bar">
              <div className="terminal-dot bg-red-500" />
              <div className="terminal-dot bg-yellow-400" />
              <div className="terminal-dot bg-green-400" />
              <span className="font-mono text-[10px] text-muted ml-2">{project.id} — preview</span>
            </div>
            <img src={project.screenshot} alt={project.title} className="w-full h-48 object-cover object-top" />
          </div>
        )}

        {/* Stats row */}
        <div className="glass-card mb-2">
          <div className="grid grid-cols-3 divide-x divide-[rgba(0,212,255,0.08)]">
            {[
              { label: 'Role', value: project.role },
              { label: 'Duration', value: project.duration },
              { label: 'Category', value: project.category },
            ].map((item, i) => (
              <div key={i} className="px-5 py-4">
                <p className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">{item.label}</p>
                <p className="font-mono text-[11px] text-[#e2eaff]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Impact */}
        <div className="glass-card p-5 mb-2 border-l-2 border-neon">
          <p className="font-mono text-[9px] text-muted tracking-[3px] uppercase mb-2">KEY IMPACT</p>
          <p className="text-[14px] text-[#c8d8f0] leading-relaxed">{project.impact}</p>
        </div>

        {/* Problem / Approach / Outcome */}
        <div className="space-y-2 mb-2">
          {[
            { num: '01', label: 'The Problem', color: '#f43f5e', text: project.problem },
            { num: '02', label: 'My Approach', color: '#00d4ff', text: project.approach },
            { num: '03', label: 'Outcome', color: '#00f5d4', text: project.outcome },
          ].map(item => (
            <div key={item.num} className="glass-card overflow-hidden"
              style={{ borderLeft: `2px solid ${item.color}44` }}>
              <div className="px-5 py-3 border-b border-[rgba(0,212,255,0.05)] flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold" style={{ color: item.color }}>{item.num}</span>
                <span className="font-mono text-[11px] tracking-[2px] uppercase font-bold" style={{ color: item.color }}>{item.label}</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-[13px] text-muted leading-[1.9]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture */}
        {project.architecture && (
          <div className="glass-card p-5 mb-2">
            <p className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4">System Architecture</p>
            <div className="space-y-2">
              {project.architecture.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-5 h-5 border border-cyan-500/30 flex items-center justify-center">
                      <span className="font-mono text-[8px] text-cyan">{i + 1}</span>
                    </div>
                    {i < project.architecture!.length - 1 && <div className="w-px h-3 bg-cyan-500/20 mt-1" />}
                  </div>
                  <p className="font-mono text-[11px] text-muted leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="glass-card p-5 mb-2">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {project.stack.map(s => (
              <span key={s} className="font-mono text-[9px] px-2.5 py-1.5 bg-cyan-500/5 border border-cyan-500/15 text-cyan2">{s}</span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="glass-card p-5">
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-3">Links</p>
          <div className="flex flex-wrap gap-3">
            <a href={project.github} target="_blank"
              className="font-mono text-[11px] px-4 py-2 bg-cyan text-bg hover:bg-neon transition-colors">
              GitHub →
            </a>
            {project.demo && (
              <a href={project.demo} target="_blank"
                className="font-mono text-[11px] px-4 py-2 border border-neon text-neon hover:bg-neon/10 transition-colors">
                Live Demo →
              </a>
            )}
            {project.report && (
              <a href={project.report} download
                className="font-mono text-[11px] px-4 py-2 border border-[#ffaa00]/40 text-[#ffaa00] hover:bg-[#ffaa00]/10 transition-colors">
                ↓ Download Report
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Hook to use the modal
export function useProjectModal() {
  const [activeId, setActiveId] = useState<string | null>(null)

  return {
    activeId,
    open: (id: string) => setActiveId(id),
    close: () => setActiveId(null),
    Modal: activeId ? (
      <AnimatePresence>
        <ProjectModal projectId={activeId} onClose={() => setActiveId(null)} />
      </AnimatePresence>
    ) : null
  }
}

export default ProjectModal
'use client'
import { useRef, MouseEvent } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'
import { projects } from '@/data/projects'
import Image from 'next/image'

function ProjectCard({ p, index }: { p: typeof projects[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10
    el.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`project-card-inner tilt-card glass-card relative overflow-hidden transition-all duration-300 hover:border-[rgba(0,212,255,0.3)] ${p.featured ? 'md:col-span-2' : ''}`}
    >
      {/* Top glow accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-0 group-hover:opacity-100" />

      <div className="p-8 md:p-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <span className="font-mono text-[10px] text-muted tracking-[2px]">{p.num} {p.featured ? '— FLAGSHIP' : ''}</span>
          <div className="flex gap-3">
            {p.demo && (
              <a href={p.demo} target="_blank" className="font-mono text-[10px] text-neon border border-[rgba(0,245,212,0.3)] px-2.5 py-1 hover:bg-[rgba(0,245,212,0.07)] transition-colors">
                LIVE
              </a>
            )}
            <a href={p.github} target="_blank" className="font-mono text-[10px] text-cyan border border-[rgba(0,212,255,0.25)] px-2.5 py-1 hover:bg-[rgba(0,212,255,0.07)] transition-colors">
              GH
            </a>
          </div>
        </div>

        <h3 className="font-orbitron text-xl font-bold text-[#e2eaff] mb-1 leading-tight">
          <span className="text-cyan">{p.title}</span>
        </h3>
        <p className="font-mono text-[11px] text-muted tracking-wide mb-4">{p.subtitle}</p>

        <p className="text-[14px] text-muted leading-relaxed mb-5">{p.description}</p>

        {/* Screenshot area */}
        {p.screenshot && (
          <div className="mb-5 border border-[rgba(0,212,255,0.1)] overflow-hidden h-36 relative bg-[#020f1f]">
            <Image src={p.screenshot} alt={p.title} fill className="object-cover opacity-60 hover:opacity-80 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020f1f]" />
            <div className="absolute bottom-2 left-3 font-mono text-[9px] text-muted tracking-widest">
              // ADD SCREENSHOT TO /public{p.screenshot}
            </div>
          </div>
        )}

        {/* Impact */}
        {p.impact && (
          <div className="border-l-2 border-neon bg-[rgba(0,245,212,0.04)] px-4 py-3 mb-5">
            <span className="font-mono text-[10px] text-neon tracking-widest uppercase block mb-1">Impact</span>
            <p className="text-[13px] text-[#c8d8f0] leading-relaxed">{p.impact}</p>
          </div>
        )}

        {/* Stack */}
        <div className="flex flex-wrap gap-2">
          {p.stack.map(s => (
            <span key={s} className="font-mono text-[9px] tracking-[1px] px-2.5 py-1 bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] text-cyan2">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Portfolio" title="Selected " accent="Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(0,212,255,0.05)]">
          {projects.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

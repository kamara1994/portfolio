'use client'
import { useRef, MouseEvent, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'
import { projects } from '@/data/projects'
import Link from 'next/link'

function ProjectCard({ p, index }: { p: typeof projects[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
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
      transition={{ duration: 0.5, delay: index * 0.06 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`project-card-inner glass-card relative overflow-hidden transition-all duration-300 hover:border-[rgba(0,212,255,0.3)] group ${p.featured ? 'md:col-span-2' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Screenshot preview */}
      <div className="relative h-40 bg-[#000d1a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.screenshot || ''}
          alt={p.title}
          className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-500 scale-105 group-hover:scale-100"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.style.display = 'none'
            if (t.nextSibling) (t.nextSibling as HTMLElement).style.display = 'flex'
          }}
        />
        <div
          className="absolute inset-0 hidden items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), #020818)' }}
        >
          <span className="font-orbitron text-4xl font-black text-[rgba(0,212,255,0.2)]">{p.num}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050e24] via-[rgba(5,14,36,0.4)] to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[9px] tracking-[1.5px] uppercase px-2 py-1 bg-[rgba(2,8,24,0.8)] border border-[rgba(0,212,255,0.3)] text-cyan">
            {p.category}
          </span>
        </div>
        {p.featured && (
          <div className="absolute top-3 right-3">
            <span className="font-mono text-[9px] tracking-[1.5px] uppercase px-2 py-1 bg-[rgba(0,245,212,0.1)] border border-[rgba(0,245,212,0.3)] text-neon">
              FLAGSHIP
            </span>
          </div>
        )}
      </div>

      <div className="p-7">
        <div className="flex items-start justify-between mb-3">
          <span className="font-mono text-[9px] text-muted tracking-[2px]">{p.num}</span>
          <div className="flex gap-2">
            {p.demo && (
              <a href={p.demo} target="_blank" onClick={e => e.stopPropagation()}
                className="font-mono text-[9px] text-neon border border-[rgba(0,245,212,0.3)] px-2 py-1 hover:bg-[rgba(0,245,212,0.07)] transition-colors">
                LIVE
              </a>
            )}
            <a href={p.github} target="_blank" onClick={e => e.stopPropagation()}
              className="font-mono text-[9px] text-cyan border border-[rgba(0,212,255,0.25)] px-2 py-1 hover:bg-[rgba(0,212,255,0.07)] transition-colors">
              GH
            </a>
          </div>
        </div>

        <h3 className="font-orbitron text-lg font-bold text-[#e2eaff] mb-1 leading-tight group-hover:text-cyan transition-colors">
          {p.title}
        </h3>
        <p className="font-mono text-[10px] text-muted tracking-wide mb-3">{p.subtitle}</p>
        <p className="text-[13px] text-muted leading-relaxed mb-4 line-clamp-3">{p.description}</p>

        <div className="border-l-2 border-neon bg-[rgba(0,245,212,0.03)] px-3 py-2 mb-4">
          <p className="text-[12px] text-[#c8d8f0] leading-relaxed">{p.impact}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.stack.slice(0, 5).map(s => (
            <span key={s} className="font-mono text-[9px] tracking-[1px] px-2 py-1 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.12)] text-cyan2">
              {s}
            </span>
          ))}
          {p.stack.length > 5 && (
            <span className="font-mono text-[9px] px-2 py-1 text-muted">+{p.stack.length - 5} more</span>
          )}
        </div>

        <Link
          href={`/projects/${p.id}`}
          className="flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase text-neon group-hover:gap-4 transition-all duration-200"
        >
          View Case Study →
        </Link>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')

  const allCategories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  return (
    <section id="projects" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Portfolio" title="Selected " accent="Projects" />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10 -mt-6">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 transition-all duration-200"
              style={{
                border: activeCategory === cat ? '1px solid rgba(0,212,255,0.6)' : '1px solid rgba(0,212,255,0.15)',
                color: activeCategory === cat ? '#00d4ff' : '#8899bb',
                background: activeCategory === cat ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/kamara1994"
            target="_blank"
            className="btn-hex border border-[rgba(0,212,255,0.3)] text-muted font-mono text-[11px] tracking-[2px] uppercase px-8 py-3 hover:border-cyan hover:text-cyan transition-all"
          >
            View All on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
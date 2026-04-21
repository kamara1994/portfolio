'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { projects } from '@/data/projects'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'
import Link from 'next/link'

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find(p => p.id === params.slug)

  if (!project) {
    return (
      <div className="min-h-screen bg-[#020818] flex items-center justify-center">
        <div className="text-center">
          <div className="font-orbitron text-4xl text-cyan mb-4">404</div>
          <div className="font-mono text-muted mb-8">Project not found</div>
          <Link href="/#projects" className="btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-6 py-3">
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = projects.findIndex(p => p.id === params.slug)
  const prevProject = projects[currentIndex - 1]
  const nextProject = projects[currentIndex + 1]

  return (
    <main className="relative min-h-screen bg-[#020818]">
      <GlowOrbs />
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-6 border-b border-[rgba(0,212,255,0.08)]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[2px] uppercase mb-8">
              <Link href="/" className="hover:text-cyan transition-colors">Home</Link>
              <span className="text-[rgba(0,212,255,0.3)]">→</span>
              <Link href="/#projects" className="hover:text-cyan transition-colors">Projects</Link>
              <span className="text-[rgba(0,212,255,0.3)]">→</span>
              <span className="text-cyan">{project.title}</span>
            </div>

            {/* Category + Number */}
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-[10px] tracking-[3px] uppercase px-3 py-1 border border-[rgba(0,212,255,0.3)] text-cyan">
                {project.category}
              </span>
              <span className="font-mono text-[10px] text-muted">{project.num}</span>
            </div>

            {/* Title */}
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-[#e2eaff] leading-tight mb-4">
              {project.title}
            </h1>
            <p className="font-mono text-lg text-cyan mb-6">{project.subtitle}</p>
            <p className="text-[15px] text-muted leading-relaxed max-w-3xl mb-8">{project.description}</p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Role</div>
                <div className="font-mono text-[12px] text-[#e2eaff]">{project.role}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Duration</div>
                <div className="font-mono text-[12px] text-[#e2eaff]">{project.duration}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Category</div>
                <div className="font-mono text-[12px] text-[#e2eaff]">{project.category}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href={project.github}
                target="_blank"
                className="btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-neon transition-colors"
              >
                View on GitHub →
              </a>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  className="btn-hex border border-cyan text-cyan font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-[rgba(0,212,255,0.08)] transition-colors"
                >
                  Live Demo →
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCREENSHOT */}
      {project.screenshot && (
        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="terminal-box overflow-hidden">
              <div className="terminal-bar">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-400" />
                <span className="font-mono text-[10px] text-muted ml-2">{project.id}.png</span>
              </div>
              <div className="relative bg-[#000d1a] min-h-[300px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.screenshot}
                  alt={project.title}
                  className="w-full h-auto max-h-[500px] object-contain"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.style.display = 'none'
                    if (t.nextSibling) (t.nextSibling as HTMLElement).style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center flex-col gap-3">
                  <div className="font-mono text-[11px] text-muted">Screenshot coming soon</div>
                  <div className="font-mono text-[10px] text-[rgba(0,212,255,0.3)]">Add {project.screenshot} to /public</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CASE STUDY */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Problem/Approach/Outcome */}
          <div className="lg:col-span-2 space-y-8">

            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-[rgba(244,63,94,0.4)] flex items-center justify-center">
                  <span className="text-red-400 text-[10px] font-bold">01</span>
                </div>
                <div className="font-mono text-[11px] tracking-[3px] uppercase text-red-400">The Problem</div>
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{project.problem}</p>
            </motion.div>

            {/* Approach */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-[rgba(0,212,255,0.4)] flex items-center justify-center">
                  <span className="text-cyan text-[10px] font-bold">02</span>
                </div>
                <div className="font-mono text-[11px] tracking-[3px] uppercase text-cyan">My Approach</div>
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{project.approach}</p>
            </motion.div>

            {/* Outcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-[rgba(0,245,212,0.4)] flex items-center justify-center">
                  <span className="text-neon text-[10px] font-bold">03</span>
                </div>
                <div className="font-mono text-[11px] tracking-[3px] uppercase text-neon">Outcome & Impact</div>
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{project.outcome}</p>
            </motion.div>
          </div>

          {/* RIGHT — Stack + Architecture */}
          <div className="space-y-6">

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4 pb-3 border-b border-[rgba(0,212,255,0.1)]">
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {project.stack.map(s => (
                  <span key={s} className="font-mono text-[9px] tracking-[1px] px-2.5 py-1.5 bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] text-cyan2">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Architecture */}
            {project.architecture && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4 pb-3 border-b border-[rgba(0,212,255,0.1)]">
                  Architecture
                </div>
                <div className="space-y-2">
                  {project.architecture.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="font-mono text-[9px] text-cyan mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</div>
                      <div className="font-mono text-[10px] text-muted leading-relaxed">{step}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <section className="px-6 py-12 border-t border-[rgba(0,212,255,0.08)]">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.id}`}
              className="glass-card px-6 py-4 hover:border-[rgba(0,212,255,0.3)] transition-colors group"
            >
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">← Previous</div>
              <div className="font-mono text-[12px] text-[#e2eaff] group-hover:text-cyan transition-colors">{prevProject.title}</div>
            </Link>
          ) : <div />}

          <Link
            href="/#projects"
            className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors"
          >
            All Projects
          </Link>

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.id}`}
              className="glass-card px-6 py-4 hover:border-[rgba(0,212,255,0.3)] transition-colors group text-right"
            >
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Next →</div>
              <div className="font-mono text-[12px] text-[#e2eaff] group-hover:text-cyan transition-colors">{nextProject.title}</div>
            </Link>
          ) : <div />}
        </div>
      </section>

      <Footer />
    </main>
  )
}
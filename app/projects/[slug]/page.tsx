'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { projects } from '@/data/projects'
import Nav from '@/components/Nav'
import dynamic from 'next/dynamic'
const FortressArchitecture = dynamic(() => import('@/components/3d/FortressArchitecture'), { ssr: false })
const BluexArchitecture = dynamic(() => import('@/components/3d/BluexArchitecture'), { ssr: false })
const WebsiteMockup = dynamic(() => import('@/components/3d/WebsiteMockup'), { ssr: false })
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'
import Link from 'next/link'

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const project = projects.find(p => p.id === slug)
  const [imgError, setImgError] = useState(false)

  const currentIndex = projects.findIndex(p => p.id === slug)
  const prevProject = projects[currentIndex - 1]
  const nextProject = projects[currentIndex + 1]

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

  return (
    <main className="relative min-h-screen bg-[#020818]">
      <GlowOrbs />
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-40" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-mono text-[10px] text-muted tracking-[2px] uppercase mb-10">
            <Link href="/" className="hover:text-cyan transition-colors">Home</Link>
            <span className="text-[rgba(0,212,255,0.3)]">/</span>
            <Link href="/#projects" className="hover:text-cyan transition-colors">Projects</Link>
            <span className="text-[rgba(0,212,255,0.3)]">/</span>
            <span className="text-cyan truncate">{project.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-3 mb-6">
                <span className="font-mono text-[10px] tracking-[3px] uppercase px-3 py-1.5 border border-[rgba(0,212,255,0.4)] text-cyan bg-[rgba(0,212,255,0.06)]">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="font-mono text-[10px] tracking-[2px] uppercase px-3 py-1.5 border border-[rgba(0,245,212,0.4)] text-neon bg-[rgba(0,245,212,0.06)]">
                    ★ Flagship Project
                  </span>
                )}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="font-orbitron font-black leading-tight mb-4 text-[#e2eaff]"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                {project.title}
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="font-mono text-base text-cyan mb-6">{project.subtitle}</motion.p>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="text-[15px] text-muted leading-[1.9] mb-8">{project.description}</motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="grid grid-cols-3 border border-[rgba(0,212,255,0.1)] mb-8">
                {[
                  { label: 'Role', val: project.role },
                  { label: 'Duration', val: project.duration },
                  { label: 'Category', val: project.category },
                ].map((m, i) => (
                  <div key={m.label} className={`px-4 py-3 ${i < 2 ? 'border-r border-[rgba(0,212,255,0.1)]' : ''}`}>
                    <div className="font-mono text-[8px] text-muted tracking-[2px] uppercase mb-1">{m.label}</div>
                    <div className="font-mono text-[11px] text-[#e2eaff] leading-tight">{m.val}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="flex flex-wrap gap-3 mb-4">
                <a href={project.github} target="_blank"
                  className="btn-hex bg-cyan text-bg font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-neon transition-colors">
                  GitHub →
                </a>
                {project.demo && (
                  <a href={project.demo} target="_blank"
                    className="btn-hex border border-neon text-neon font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-[rgba(0,245,212,0.08)] transition-colors">
                    Live Demo →
                  </a>
                )}
                {project.report && (
                  <a href={project.report} download
                    className="btn-hex border border-[rgba(255,170,0,0.5)] text-[#ffaa00] font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-[rgba(255,170,0,0.08)] transition-colors">
                    ↓ Report
                  </a>
                )}
                <Link href="/#projects"
                  className="btn-hex border border-[rgba(0,212,255,0.2)] text-muted font-mono text-[11px] tracking-[2px] uppercase px-6 py-3 hover:border-cyan hover:text-cyan transition-colors">
                  All Projects
                </Link>
              </motion.div>

              {project.demo && (
                <motion.a href={project.demo} target="_blank"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 px-4 py-3 border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.04)] hover:border-neon hover:bg-[rgba(0,245,212,0.08)] transition-all group w-fit">
                  <span className="w-2 h-2 rounded-full bg-neon animate-pulse-slow" />
                  <span className="font-mono text-[11px] text-neon tracking-wider">LIVE SITE</span>
                  <span className="font-mono text-[11px] text-muted group-hover:text-[#e2eaff] transition-colors">
                    {project.demo.replace('https://', '')}
                  </span>
                  <span className="font-mono text-[10px] text-neon">↗</span>
                </motion.a>
              )}
            </div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="terminal-box overflow-hidden">
                <div className="terminal-bar">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-400" />
                  <div className="terminal-dot bg-green-400" />
                  <span className="font-mono text-[10px] text-muted ml-2">{project.id} — preview</span>
                </div>
                <div className="relative bg-[#000d1a] min-h-[260px] flex items-center justify-center">
                  {!imgError && project.screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.screenshot} alt={project.title}
                      className="w-full h-auto max-h-[360px] object-contain"
                      onError={() => setImgError(true)} />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center"
                      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(129,140,248,0.04))' }}>
                      <div className="font-orbitron text-6xl font-black text-[rgba(0,212,255,0.15)]">{project.num}</div>
                      <div className="font-mono text-[11px] text-muted tracking-wider">{project.title}</div>
                      <div className="font-mono text-[9px] text-[rgba(0,212,255,0.3)] tracking-widest uppercase">
                        Add /public{project.screenshot} to show preview
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#000d1a] to-transparent" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="px-6 py-8 border-y border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] text-muted tracking-[3px] uppercase mb-4">Key Impact</div>
          <div className="border-l-2 border-neon pl-6">
            <p className="text-[15px] text-[#c8d8f0] leading-relaxed">{project.impact}</p>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-2">Case Study</div>
          <h2 className="font-orbitron text-3xl font-black text-[#e2eaff] mb-12">How It Was Built</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[
                { num: '01', label: 'The Problem', color: '#f43f5e', border: 'rgba(244,63,94,0.3)', bg: 'rgba(244,63,94,0.03)', text: project.problem },
                { num: '02', label: 'My Approach', color: '#00d4ff', border: 'rgba(0,212,255,0.3)', bg: 'rgba(0,212,255,0.03)', text: project.approach },
                { num: '03', label: 'Outcome & Impact', color: '#00f5d4', border: 'rgba(0,245,212,0.3)', bg: 'rgba(0,245,212,0.03)', text: project.outcome },
              ].map((item, i) => (
                <motion.div key={item.num}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="rounded-sm overflow-hidden"
                  style={{ border: `1px solid ${item.border}`, background: item.bg }}>
                  <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: item.border }}>
                    <div className="w-7 h-7 border flex items-center justify-center shrink-0" style={{ borderColor: item.color }}>
                      <span className="font-mono text-[10px] font-bold" style={{ color: item.color }}>{item.num}</span>
                    </div>
                    <span className="font-mono text-[11px] tracking-[3px] uppercase font-bold" style={{ color: item.color }}>{item.label}</span>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-[14px] text-muted leading-[1.9]">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-5">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-6">
                <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4 pb-3 border-b border-[rgba(0,212,255,0.1)]">Tech Stack</div>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map(s => (
                    <span key={s} className="font-mono text-[9px] tracking-[1px] px-2.5 py-1.5 bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] text-cyan2">{s}</span>
                  ))}
                </div>
              </motion.div>

              <div className="mb-6">
                {project.id === 'fortress-v2' && <FortressArchitecture />}
                {project.id === 'blue-x' && <BluexArchitecture />}
                {project.id === 'elitecom' && <WebsiteMockup url='https://elitecom-site.vercel.app' title='ELITECOM' color='#00d4ff' screenshot='/demos/elitecom.jpg' />}
                {project.id === 'pandie-foundation' && <WebsiteMockup url='https://pandiefoundation.org' title='Pandie Foundation' color='#00ff88' screenshot='/demos/pandie.jpg' />}
              </div>

              {project.architecture && (
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-6">
                  <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4 pb-3 border-b border-[rgba(0,212,255,0.1)]">System Architecture</div>
                  <div className="space-y-3">
                    {project.architecture.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-5 h-5 border border-[rgba(0,212,255,0.3)] flex items-center justify-center">
                            <span className="font-mono text-[8px] text-cyan">{i + 1}</span>
                          </div>
                          {i < project.architecture!.length - 1 && <div className="w-px h-3 bg-[rgba(0,212,255,0.2)] mt-1" />}
                        </div>
                        <div className="font-mono text-[10px] text-muted leading-relaxed pt-0.5">{step}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <div className="font-mono text-[10px] tracking-[3px] uppercase text-neon mb-4 pb-3 border-b border-[rgba(0,212,255,0.1)]">Links</div>
                <div className="space-y-3">
                  <a href={project.github} target="_blank"
                    className="flex items-center justify-between font-mono text-[11px] px-3 py-2.5 border border-[rgba(0,212,255,0.2)] text-cyan hover:border-cyan hover:bg-[rgba(0,212,255,0.06)] transition-all group">
                    <span>⌥ GitHub Repository</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  {project.demo && (
                    <a href={project.demo} target="_blank"
                      className="flex items-center justify-between font-mono text-[11px] px-3 py-2.5 border border-[rgba(0,245,212,0.3)] text-neon hover:border-neon hover:bg-[rgba(0,245,212,0.06)] transition-all group">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
                        View Live Website
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  )}
                  {project.report && (
                    <a href={project.report} download
                      className="flex items-center justify-between font-mono text-[11px] px-3 py-2.5 border border-[rgba(255,170,0,0.3)] text-[#ffaa00] hover:border-[#ffaa00] hover:bg-[rgba(255,170,0,0.06)] transition-all group">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00] animate-pulse-slow" />
                        Download Technical Report
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">↓</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* MORE PROJECTS */}
      <section className="px-6 py-16 border-t border-[rgba(0,212,255,0.08)] bg-[rgba(5,14,36,0.4)]">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] text-muted tracking-[3px] uppercase mb-6">More Projects</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.filter(p => p.id !== project.id).slice(0, 3).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link href={`/projects/${p.id}`} className="glass-card p-5 block hover:border-[rgba(0,212,255,0.3)] transition-all group">
                  <div className="font-mono text-[9px] text-cyan tracking-[2px] uppercase mb-2">{p.category}</div>
                  <div className="font-orbitron text-sm font-bold text-[#e2eaff] mb-2 group-hover:text-cyan transition-colors leading-tight">{p.title}</div>
                  <div className="font-mono text-[10px] text-muted">{p.duration}</div>
                  <div className="font-mono text-[10px] text-neon mt-3">View →</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <section className="px-6 py-10 border-t border-[rgba(0,212,255,0.08)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          {prevProject ? (
            <Link href={`/projects/${prevProject.id}`} className="glass-card px-6 py-4 hover:border-[rgba(0,212,255,0.3)] transition-colors group max-w-xs">
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">← Previous</div>
              <div className="font-orbitron text-sm font-bold text-[#e2eaff] group-hover:text-cyan transition-colors leading-tight">{prevProject.title}</div>
            </Link>
          ) : <div />}
          <Link href="/#projects" className="font-mono text-[10px] tracking-[2px] uppercase text-muted hover:text-cyan transition-colors hidden md:block">All Projects</Link>
          {nextProject ? (
            <Link href={`/projects/${nextProject.id}`} className="glass-card px-6 py-4 hover:border-[rgba(0,212,255,0.3)] transition-colors group text-right max-w-xs">
              <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-1">Next →</div>
              <div className="font-orbitron text-sm font-bold text-[#e2eaff] group-hover:text-cyan transition-colors leading-tight">{nextProject.title}</div>
            </Link>
          ) : <div />}
        </div>
      </section>

      <Footer />
    </main>
  )
}
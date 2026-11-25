'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/data/projects'
import ProjectMedia from './ProjectMedia'
import NextProjectTitle, { TitleMotionControl } from './NextProjectTitle'

export function ProjectReadingProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
        if (ref.current) ref.current.style.transform = 'scaleX(' + progress + ')'
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(document.body)
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  return <div className="pe-progress" aria-hidden="true"><div ref={ref} /></div>
}

export function ProjectMediaStage({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    const update = () => setFull(document.fullscreenElement === ref.current)
    setSupported(Boolean(document.fullscreenEnabled && ref.current?.requestFullscreen))
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  async function fullscreen() {
    try {
      setError('')
      if (document.fullscreenElement === ref.current) await document.exitFullscreen()
      else await ref.current?.requestFullscreen()
    } catch { setError('Fullscreen is unavailable in this browser.') }
  }
  return <div ref={ref} className="pe-media-stage">
    <div className="pe-media-bar">
      <div className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="pe-media-dot"/><span className="truncate">{project.title}</span></div>
      <span className="text-smoke shrink-0">{project.video ? 'Demo' : project.screenshot ? 'Screenshot' : 'Preview'}</span>
      {supported && <button type="button" className="pe-small-button" onClick={fullscreen}>{full ? 'Exit fullscreen' : 'Fullscreen'} <span aria-hidden="true">↗</span></button>}
    </div>
    <div className="pe-media-body relative aspect-video w-full overflow-hidden bg-panel"><ProjectMedia project={project} priority /></div>
    {error && <p role="status" className="px-3 py-2 text-sm text-smoke">{error}</p>}
  </div>
}

export function ProjectArchitecture({ steps }: { steps: string[] }) {
  const [selected, setSelected] = useState(0)
  if (!steps.length) return null
  const current = Math.min(selected, steps.length - 1)
  return <section id="architecture" className="scroll-mt-28">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="font-display text-[32px] font-bold uppercase leading-none">How data flows</h2><p className="mt-2 text-sm text-smoke">Explore the documented architecture step by step.</p></div>
      <span className="pe-eyebrow">Architecture explorer · {steps.length} stages</span>
    </div>
    <div className="pe-architecture mt-5">
      <ol className="pe-flow" aria-label="Documented architecture stages">
        {steps.map((step, i) => <li key={i}>
          <button type="button" aria-pressed={current === i} className="pe-flow-node" onClick={() => setSelected(i)}><span className="pe-step-number">{String(i+1).padStart(2,'0')}</span><span>{step.split('→')[0].trim()}</span></button>
        </li>)}
      </ol>
      <div className="pe-stage-detail" aria-live="polite">
        <p className="pe-eyebrow">Selected stage {String(current+1).padStart(2,'0')} / {steps.length}</p>
        <p className="mt-3 text-xl leading-relaxed text-snow">{steps[current]}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="pe-small-button" disabled={current===0} onClick={()=>setSelected(current-1)}>← Previous</button>
          <button type="button" className="pe-small-button" disabled={current===steps.length-1} onClick={()=>setSelected(current+1)}>Next stage →</button>
        </div>
      </div>
    </div>
    <details className="mt-3 rounded-lg border border-line p-4 text-smoke">
      <summary className="cursor-pointer text-snow">Read all architecture stages</summary>
      <ol className="mt-3 divide-y divide-line">{steps.map((step,i)=><li className="grid grid-cols-[2rem_1fr] gap-3 py-3 text-snow/85" key={i}><span className="text-smoke">{i+1}</span>{step}</li>)}</ol>
    </details>
  </section>
}

export function ProjectEvidence({ project }: { project: Project }) {
  const items = [
    {label:'Source code',detail:'Original code excerpts and source availability',href:'#source-code',external:false},
    ...(project.architecture?.length ? [{label:'System architecture',detail:'Documented implementation stages',href:'#architecture',external:false}] : []),
    ...(project.report ? [{label:'Project report',detail:'Existing project documentation',href:project.report,external:false}] : []),
    ...(project.screenshot || project.video ? [{label:'Project media',detail:project.video ? 'Project demonstration' : 'Existing project screenshot',href:'#project-media',external:false}] : []),
    ...(project.demo ? [{label:'Live project link',detail:'Open the listed deployment',href:project.demo,external:true}] : []),
  ]
  return <section id="evidence" className="scroll-mt-28">
    <h2 className="font-display text-[32px] font-bold uppercase leading-none">Project evidence</h2>
    <p className="mt-2 text-sm text-smoke">Explore the available project materials. Lab and development work retain their original status.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item=><a key={item.href} href={item.href} target={item.external?'_blank':undefined} rel={item.external?'noopener noreferrer':undefined} className="pe-evidence-card"><span className="flex items-center justify-between gap-3 font-semibold text-snow">{item.label}<span aria-hidden="true" className="text-signal">↗</span></span><span className="mt-2 block text-sm text-smoke">{item.detail}</span></a>)}
    </div>
  </section>
}

export function ProjectSectionNav({ architecture }: { architecture: boolean }) {
  return <nav aria-label="Project sections" className="pe-section-nav"><a href="#project-overview">Overview</a><a href="#project-media">Media</a><a href="#project-details">Case study</a><a href="#evidence">Evidence</a><a href="#source-code">Code</a>{architecture&&<a href="#architecture">Architecture</a>}</nav>
}

const previewThemes: Record<string, string> = {
  'blue-soc-p8': 'soc', 'salone-aegis': 'network', 'enterprise-networking': 'enterprise',
  'fortress-v2': 'cloud', 'blue-x': 'threat', 'pweza-voice-agent': 'voice',
  'elitecom': 'engineering', 'pandie-foundation': 'community',
}

export function ProjectNextNavigation({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false)
  const theme = previewThemes[project.id] ?? 'network'
  const screenshot = project.screenshot
  return <div className="group pe-next border-t border-line" data-next-theme={theme}>
    <div className="pe-next-backdrop" aria-hidden="true">
      {screenshot && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pe-next-image" src={screenshot} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)} />
      ) : project.video && !failed ? (
        <video className="pe-next-image" src={project.video} muted playsInline preload="metadata" tabIndex={-1} onError={()=>setFailed(true)} />
      ) : (
        <div className="pe-next-abstract"><div className="pe-next-grid"/><span className="pe-next-orbit pe-next-orbit-one"/><span className="pe-next-orbit pe-next-orbit-two"/><span className="pe-next-orbit pe-next-orbit-three"/></div>
      )}
    </div>
    <div className="wrap project-wrap pe-next-inner py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[15px] text-smoke">Next project</p><TitleMotionControl /></div>
      <Link href={'/projects/'+project.id} className="pe-next-link">
        <div className="pe-next-copy min-w-0"><NextProjectTitle title={project.title} projectId={project.id}/><p className="mt-3 max-w-[60ch] text-smoke">{project.subtitle}</p></div>
        <span className="pe-next-arrow" aria-hidden="true">↗</span>
      </Link>
    </div>
  </div>
}

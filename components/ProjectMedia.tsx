'use client'
import { useState } from 'react'
import type { Project } from '@/data/projects'
import { BLUR } from '@/lib/blur'

// Slow-network fallback: the blurred preview is the element's background, so it
// shows until the real image paints over it. No JavaScript involved.
const ph = (src?: string) => (src && BLUR[src] ? { backgroundImage: `url(${BLUR[src]})`, backgroundSize: 'cover', backgroundPosition: 'top center' } : undefined)

/** First component of each documented architecture step, e.g. "Splunk → Alert Trigger" gives "Splunk". */
function steps(arch?: string[]) {
  return (arch || []).slice(0, 6).map((a) => a.split('→')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim()).filter(Boolean)
}

/** Plays the project's 10-second demo loop; falls back to its screenshot, then to a quiet title card. */
export default function ProjectMedia({ project, priority = false, controls = true }: { project: Project; priority?: boolean; controls?: boolean }) {
  const { video, screenshot, title } = project

  const [failed, setFailed] = useState(false)
  if (video && !failed) {
    return (
      <video
        className="h-full w-full object-contain bg-ink"
        src={video}
        poster={screenshot}
        onError={() => setFailed(true)}
        controls={controls}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        aria-label={`${title} demo`}
        style={ph(screenshot)}
      />
    )
  }

  if (screenshot) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="h-full w-full object-contain bg-ink"
        src={screenshot}
        alt={`${title} — ${project.mediaLabel || 'screenshot'}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={ph(screenshot)}
      />
    )
  }

  const flow = steps(project.architecture)
  if (flow.length >= 3) {
    return (
      <div className="pm-flow" role="img" aria-label={`${title} architecture diagram: ${flow.join(', then ')}`}>
        <span className="pm-flow-kicker">How it works · diagram</span>
        <ol className="pm-flow-nodes" aria-hidden="true">
          {flow.map((n, i) => (
            <li key={i}><b>{String(i + 1).padStart(2, '0')}</b><span>{n}</span></li>
          ))}
        </ol>
        <span className="pm-flow-note">Drawn from the case study architecture, not a screenshot</span>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-raised to-panel p-5 text-center">
      <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="h-12 w-12 text-signal/70"><circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5"/><path d="M20 15l14 9-14 9V15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
      <span className="font-display text-2xl font-semibold uppercase leading-tight text-snow/80 sm:text-3xl">{title}</span>
      <span className="text-sm text-smoke">{project.course ? 'Coursework case study · public media not available' : 'Demo video coming soon'}</span>
    </div>
  )
}

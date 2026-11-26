'use client'
import { useState } from 'react'
import type { Project } from '@/data/projects'
import { BLUR } from '@/lib/blur'

// Slow-network fallback: the blurred preview is the element's background, so it
// shows until the real image paints over it. No JavaScript involved.
const ph = (src?: string) => (src && BLUR[src] ? { backgroundImage: `url(${BLUR[src]})`, backgroundSize: 'cover', backgroundPosition: 'top center' } : undefined)

/** Plays the project's 10-second demo loop; falls back to its screenshot, then to a quiet title card. */
export default function ProjectMedia({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { video, screenshot, title } = project

  const [failed, setFailed] = useState(false)
  if (video && !failed) {
    return (
      <video
        className="h-full w-full object-contain bg-ink"
        src={video}
        poster={screenshot}
        onError={() => setFailed(true)}
        controls
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
        alt={`${title} screenshot`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={ph(screenshot)}
      />
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

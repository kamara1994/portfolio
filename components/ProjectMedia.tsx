import type { Project } from '@/data/projects'
import { BLUR } from '@/lib/blur'

// Slow-network fallback: the blurred preview is the element's background, so it
// shows until the real image paints over it. No JavaScript involved.
const ph = (src?: string) => (src && BLUR[src] ? { backgroundImage: `url(${BLUR[src]})`, backgroundSize: 'cover', backgroundPosition: 'top center' } : undefined)

/** Plays the project's 10-second demo loop; falls back to its screenshot, then to a quiet title card. */
export default function ProjectMedia({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { video, screenshot, title } = project

  if (video) {
    return (
      <video
        className="h-full w-full object-cover"
        src={video}
        poster={screenshot}
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
        className="h-full w-full object-cover object-top"
        src={screenshot}
        alt={`${title} screenshot`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={ph(screenshot)}
      />
    )
  }

  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-raised to-panel p-8">
      <span className="font-display text-5xl font-bold uppercase leading-none text-snow/15 md:text-7xl">{title}</span>
    </div>
  )
}

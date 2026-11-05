import type { Project } from '@/data/projects'

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
      />
    )
  }

  if (screenshot) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className="h-full w-full object-cover object-top"
        src={screenshot}
        alt={`${title} screenshot`}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-raised to-panel p-8">
      <span className="font-display text-5xl font-bold uppercase leading-none text-snow/15 md:text-7xl">{title}</span>
    </div>
  )
}

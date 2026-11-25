'use client'

import { useEffect, useRef } from 'react'

const art: Record<string, string> = {
  'blue-soc-p8': 'soc',
  'salone-aegis': 'network',
  'enterprise-networking': 'enterprise',
  'fortress-v2': 'cloud',
  'blue-x': 'threat',
  'pweza-voice-agent': 'voice',
  'elitecom': 'engineering',
  'pandie-foundation': 'community',
}

export function ProjectTitleArt({ title, projectId }: { title: string; projectId: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const play = () => {
      if (!motion.matches && !el.classList.contains('title-art-active')) {
        el.classList.add('title-art-active')
      }
    }
    const stop = () => el.classList.remove('title-art-active')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play()
      else stop()
    }, { threshold: 0.15 })
    const changed = () => { if (motion.matches) stop() }
    observer.observe(el)
    el.addEventListener('animationend', stop)
    el.addEventListener('pointerenter', play)
    motion.addEventListener('change', changed)
    return () => {
      observer.disconnect()
      el.removeEventListener('animationend', stop)
      el.removeEventListener('pointerenter', play)
      motion.removeEventListener('change', changed)
      stop()
    }
  }, [projectId])
  return <span ref={ref} className="project-title-art" data-art={art[projectId] ?? 'network'}>{title}</span>
}

export default function NextProjectTitle({ title, projectId }: { title: string; projectId: string }) {
  return <p className="mt-3 font-display text-[clamp(40px,6vw,88px)] font-bold uppercase leading-none"><ProjectTitleArt title={title} projectId={projectId} /></p>
}

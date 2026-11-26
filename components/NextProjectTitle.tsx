'use client'

import { useEffect, useRef, useState } from 'react'
import TitleScene from './TitleScene'

const art: Record<string, string> = {
  'blue-soc-p8': 'soc',
  'cyber375-final-ir': 'soc', 'cyber375-midterm-ir': 'soc', 'cyber375-splunk': 'soc',
  'cyber375-endpoint': 'threat', 'cyber375-network-threat': 'threat', 'cyber375-vuln-assess': 'threat',
  'cloud-cafe-architecture': 'cloud', 'aws-vpc-peering': 'cloud', 'aws-ha-resilience': 'cloud', 'aws-iam-security': 'cloud', 'aws-storage-db': 'cloud', 'aws-cloudformation': 'cloud',
  'salone-aegis': 'network',
  'enterprise-networking': 'enterprise',
  'fortress-v2': 'cloud',
  'blue-x': 'threat',
  'pweza-voice-agent': 'voice',
  'elitecom': 'engineering',
  'pandie-foundation': 'community',
}

const motionEvent = 'portfolio-title-motion-change'
const storageKey = 'portfolio-title-motion-off'
function motionDisabled() {
  try { return localStorage.getItem(storageKey) === '1' } catch { return document.documentElement.dataset.titleMotion === 'off' }
}

export function TitleMotionControl() {
  const [off, setOff] = useState(false)
  useEffect(() => {
    const sync = () => setOff(motionDisabled())
    sync()
    window.addEventListener(motionEvent, sync)
    return () => window.removeEventListener(motionEvent, sync)
  }, [])
  function toggle() {
    const next = !motionDisabled()
    document.documentElement.dataset.titleMotion = next ? 'off' : 'on'
    try { localStorage.setItem(storageKey, next ? '1' : '0') } catch {}
    setOff(next)
    window.dispatchEvent(new Event(motionEvent))
  }
  return <button type="button" aria-pressed={off} onClick={toggle} className="title-motion-control text-[13px] text-smoke hover:text-snow">{off ? 'Enable title motion' : 'Stop title motion'}</button>
}

export function ProjectTitleArt({ title, projectId }: { title: string; projectId: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [moving, setMoving] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const play = () => {
      if (!motion.matches && !motionDisabled() && !el.classList.contains('title-art-active')) {
        el.classList.add('title-art-active')
      }
      if (!motion.matches && !motionDisabled()) setMoving(true)
    }
    const stop = () => { el.classList.remove('title-art-active'); setMoving(false) }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
      else stop()
    }, { threshold: 0.15 })
    const changed = () => { if (motion.matches || motionDisabled()) stop(); else if (visible) play() }
    observer.observe(el)
    el.addEventListener('pointerenter', play)
    motion.addEventListener('change', changed)
    window.addEventListener(motionEvent, changed)
    return () => {
      observer.disconnect()
      el.removeEventListener('pointerenter', play)
      motion.removeEventListener('change', changed)
      window.removeEventListener(motionEvent, changed)
      stop()
    }
  }, [projectId])
  const scene = art[projectId] ?? 'network'
  return (
    <span ref={ref} className="project-title-art" data-art={scene}>
      <span ref={textRef} className="project-title-text">{title}</span>
      <span className="project-title-art-overlay" aria-hidden="true">{title}</span>
      <TitleScene scene={scene} animate={moving} textRef={textRef} />
    </span>
  )
}

export default function NextProjectTitle({ title, projectId }: { title: string; projectId: string }) {
  return <p className="mt-3 font-display text-[clamp(40px,6vw,88px)] font-bold uppercase leading-none"><ProjectTitleArt title={title} projectId={projectId} /></p>
}

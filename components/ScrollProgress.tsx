'use client'
import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [section, setSection] = useState('HERO')

  const sections = ['hero', 'projects', 'skills', 'certs', 'experience', 'about', 'contact']

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(pct)

      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s)
        if (el && scrollTop >= el.offsetTop - 120) {
          setSection(s.toUpperCase())
          break
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-[rgba(0,212,255,0.08)]">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d4ff, #00f5d4)',
            boxShadow: '0 0 8px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.3)',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{
            left: `calc(${progress}% - 6px)`,
            background: '#00f5d4',
            boxShadow: '0 0 8px #00f5d4, 0 0 16px #00f5d4',
            opacity: progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* BOTTOM PERCENTAGE */}
      <div
        className="fixed bottom-6 right-6 z-50 font-mono text-[10px] tracking-[2px] hidden lg:block"
        style={{ color: 'rgba(0,212,255,0.4)' }}
      >
        {Math.round(progress)}%
      </div>
    </>
  )
}
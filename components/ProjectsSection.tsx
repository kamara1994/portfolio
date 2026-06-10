'use client'
// @ts-nocheck
import { useState } from 'react'
import dynamic from 'next/dynamic'
import ProjectsFilter from '@/components/ProjectsFilter'

// 4D scene is client + WebGL only — never server-render it.
const Portfolio4D = dynamic(() => import('@/components/Portfolio4D'), { ssr: false })

export default function ProjectsSection() {
  const [view, setView] = useState('4d') // '4d' | 'grid' — 4D is the default

  const tab = (active) => ({
    fontFamily: 'ui-monospace, monospace',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '7px 16px',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'rgba(127,223,255,0.12)' : 'transparent',
    color: active ? '#7fdfff' : 'rgba(255,255,255,0.45)',
    transition: 'all 0.2s',
  })

  return (
    <div className="relative">
      <div className="flex justify-center pt-10">
        <div
          className="inline-flex"
          style={{ border: '1px solid rgba(127,223,255,0.25)', borderRadius: 8, overflow: 'hidden' }}
        >
          <button type="button" style={tab(view === 'grid')} onClick={() => setView('grid')}>
            ▦ Grid
          </button>
          <button type="button" style={tab(view === '4d')} onClick={() => setView('4d')}>
            ◇ 4D View
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <ProjectsFilter />
      ) : (
        <div style={{ marginTop: 16 }}>
          <Portfolio4D />
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: 1.5,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 8,
            }}
          >
            drag to orbit · scrub the timeline · click a node to enter
          </p>
        </div>
      )}
    </div>
  )
}

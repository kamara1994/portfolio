'use client'
// @ts-nocheck
import { useState } from 'react'
import dynamic from 'next/dynamic'
import ProjectsFilter from '@/components/ProjectsFilter'

// 3D scene is client + WebGL only — never server-render it.
const ProjectNexus = dynamic(() => import('@/components/ProjectNexus'), { ssr: false })

export default function ProjectsSection() {
  const [view, setView] = useState('3d') // '3d' | 'grid' — the 3D Nexus is the default

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
          <button type="button" style={tab(view === '3d')} onClick={() => setView('3d')}>
            ◇ 3D Nexus
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <ProjectsFilter />
      ) : (
        <div style={{ marginTop: 16 }}>
          <ProjectNexus />
        </div>
      )}
    </div>
  )
}

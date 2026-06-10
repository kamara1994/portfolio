// lib/portfolio4d/projects4d.ts
// -----------------------------------------------------------------------------
// The 4D layer now DERIVES from your real project data. Every node IS a real
// project — no duplicate list to maintain. Edit data/projects.ts and the 4D
// scene updates automatically.
//   X,Y,Z -> position (clustered by category, computed below)
//   W     -> time: a project "materializes" as the timeline reaches its start year
// -----------------------------------------------------------------------------
import { projects, type Project } from '@/data/projects'

export type Vec3 = [number, number, number]

export const EPOCHS = ['2023', '2024', '2025', '2026'] as const
export const ACCENT = '#7fdfff'
export const BG = '#05070d'

export interface Node4D {
  id: string
  project: Project
  position: Vec3
  startYear: number
  baseScale: number
  activity: number
  links: string[]
}

function startYearOf(duration: string): number {
  const m = duration.match(/(20\d{2})/)
  return m ? parseInt(m[1], 10) : 2024
}

function activityOf(status?: string): number {
  switch (status) {
    case 'in-development': return 0.95
    case 'live-demo':
    case 'verified': return 0.85
    case 'lab-validated': return 0.8
    case 'case-study': return 0.55
    default: return 0.5
  }
}

const TAU = Math.PI * 2
const CATEGORIES = Array.from(new Set(projects.map((p) => p.category)))

function buildLayout(): Node4D[] {
  const members: Record<string, string[]> = {}
  projects.forEach((p) => {
    ;(members[p.category] ||= []).push(p.id)
  })

  return projects.map((p) => {
    const ci = CATEGORIES.indexOf(p.category)
    const angle = (ci / CATEGORIES.length) * TAU
    const R = 6.4
    const cx = Math.cos(angle) * R
    const cz = Math.sin(angle) * R
    const cy = (ci % 2 === 0 ? 1.7 : -1.7) + Math.sin(angle * 2) * 0.6

    const group = members[p.category]
    const k = group.indexOf(p.id)
    const spread = group.length > 1 ? k - (group.length - 1) / 2 : 0

    const position: Vec3 = [cx + spread * 1.6, cy + spread * 1.0, cz + spread * 0.7]

    return {
      id: p.id,
      project: p,
      position,
      startYear: startYearOf(p.duration),
      baseScale: p.featured ? 1.15 : 0.85,
      activity: activityOf(p.status),
      links: [],
    }
  })
}

export const NODES_4D: Node4D[] = (() => {
  const nodes = buildLayout()
  // edges: same category, or 3+ shared stack technologies (knowledge graph)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const sameCat = a.project.category === b.project.category
      const shared = a.project.stack.filter((s) => b.project.stack.includes(s)).length
      if (sameCat || shared >= 3) a.links.push(b.id)
    }
  }
  return nodes
})()

// -----------------------------------------------------------------------------
// FINITE STATE MACHINE (plug into useReducer) — no external dependency.
// -----------------------------------------------------------------------------
export type SystemState = 'idle' | 'focusing' | 'focused' | 'returning'

export interface EngineState {
  state: SystemState
  focusId: string | null
  timeline: number // 0 .. EPOCHS.length - 1
}

export type EngineEvent =
  | { type: 'FOCUS'; id: string }
  | { type: 'ARRIVED' }
  | { type: 'RETURN' }
  | { type: 'RETURNED' }
  | { type: 'SCRUB'; value: number }

export const initialEngineState: EngineState = {
  state: 'idle',
  focusId: null,
  timeline: EPOCHS.length - 1, // start at "now" so everything is visible
}

export function engineReducer(s: EngineState, e: EngineEvent): EngineState {
  switch (e.type) {
    case 'FOCUS':
      return { ...s, state: 'focusing', focusId: e.id }
    case 'ARRIVED':
      return s.state === 'focusing' ? { ...s, state: 'focused' } : s
    case 'RETURN':
      return { ...s, state: 'returning' }
    case 'RETURNED':
      return { ...s, state: 'idle', focusId: null }
    case 'SCRUB':
      return { ...s, timeline: e.value }
    default:
      return s
  }
}

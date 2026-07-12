// lib/nexus/graph.ts
// -----------------------------------------------------------------------------
// PROJECT NEXUS graph — derives a 3D constellation directly from the real
// project list. Every node IS a real project; edit data/projects.ts and the
// scene updates. No parallel list to maintain.
//   position  -> clustered by category into orbital arms around a central core
//   color     -> per-category neon accent
//   activity  -> derived from project status (drives glow intensity + pulse)
//   links     -> same category OR 3+ shared stack technologies (knowledge graph)
// -----------------------------------------------------------------------------
import { projects, type Project } from '@/data/projects'

export type Vec3 = [number, number, number]

export const CORE_COLOR = '#7fdfff'
export const BG = '#03060f'

// Distinct neon accent per domain. Falls back through the palette for any
// category not explicitly mapped, so new categories still get a stable color.
const PALETTE = [
  '#7c5cff', '#00e0ff', '#ff4d6d', '#ffb020', '#b14cff',
  '#2dd4bf', '#38bdf8', '#34d399', '#f59e0b', '#60a5fa',
]

const CATEGORIES: string[] = Array.from(new Set(projects.map((p) => p.category)))

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c, i) => [c, PALETTE[i % PALETTE.length]])
)

export interface NexusNode {
  id: string
  project: Project
  position: Vec3
  color: string
  baseScale: number
  activity: number
  startYear: number
  links: string[]
}

function startYearOf(duration: string): number {
  const m = duration.match(/(20\d{2})/)
  return m ? parseInt(m[1], 10) : 2024
}

function activityOf(status?: string): number {
  switch (status) {
    case 'in-development': return 0.98
    case 'live-demo':
    case 'verified': return 0.88
    case 'lab-validated': return 0.82
    case 'case-study': return 0.6
    default: return 0.55
  }
}

const TAU = Math.PI * 2

// Clustered layout: each category is an "arm" placed on a tilted ring around the
// core; its member projects fan out on a small local sphere. Featured projects
// sit slightly closer to the core and render larger.
function buildLayout(): NexusNode[] {
  const members: Record<string, string[]> = {}
  projects.forEach((p) => { (members[p.category] ||= []).push(p.id) })

  return projects.map((p) => {
    const ci = CATEGORIES.indexOf(p.category)
    const armAngle = (ci / CATEGORIES.length) * TAU
    const R = 9.6
    const tilt = Math.sin(armAngle * 1.7) * 3.2 // verticality so it reads as a 3D cloud, not a disk

    const armX = Math.cos(armAngle) * R
    const armZ = Math.sin(armAngle) * R
    const armY = tilt

    const group = members[p.category]
    const k = group.indexOf(p.id)
    const n = group.length
    // fan members out along a short local golden-angle spiral
    const t = n > 1 ? k - (n - 1) / 2 : 0
    const localAngle = k * 2.399963 // golden angle
    const spread = 2.4
    const near = p.featured ? -1.3 : 0 // featured pulled toward core

    const position: Vec3 = [
      armX * (1 + near * 0.05) + Math.cos(localAngle) * spread + t * 0.4,
      armY + Math.sin(localAngle) * spread * 0.7 + t * 0.9,
      armZ * (1 + near * 0.05) + Math.sin(localAngle) * spread * 0.5 - t * 0.4,
    ]

    return {
      id: p.id,
      project: p,
      position,
      color: CATEGORY_COLORS[p.category],
      baseScale: p.featured ? 1.25 : 0.9,
      activity: activityOf(p.status),
      startYear: startYearOf(p.duration),
      links: [],
    }
  })
}

export const NEXUS_NODES: NexusNode[] = (() => {
  const nodes = buildLayout()
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

// Deduplicated undirected edge list for rendering.
export const NEXUS_EDGES: [string, string][] = (() => {
  const seen = new Set<string>()
  const list: [string, string][] = []
  NEXUS_NODES.forEach((n) =>
    n.links.forEach((l) => {
      const key = [n.id, l].sort().join('|')
      if (!seen.has(key)) { seen.add(key); list.push([n.id, l]) }
    })
  )
  return list
})()

export const NEXUS_CATEGORIES = CATEGORIES

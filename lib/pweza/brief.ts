import { safe } from '@/lib/alerts/store'
import type { Fit } from './jd'

// 📎 Shareable briefing pack: a clean page a recruiter can forward to the hiring team —
// role fit (if they pasted a job), the questions they asked and PWEZA's answers, and proof links.

export type Brief = { id: string; created: number; fit?: Fit; qa: { q: string; a: string }[]; company?: string }

const id = () => Array.from(crypto.getRandomValues(new Uint8Array(9))).map((b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')

export async function saveBrief(b: Omit<Brief, 'id' | 'created'>): Promise<string | null> {
  const brief: Brief = { ...b, id: id(), created: Date.now() }
  return safe(async (r) => { await r.set(`brief:${brief.id}`, brief, { ex: 90 * 86_400 }); return brief.id }, null)
}

export async function loadBrief(briefId: string): Promise<Brief | null> {
  if (!/^[a-z0-9]{6,20}$/.test(briefId)) return null
  return safe((r) => r.get<Brief>(`brief:${briefId}`), null)
}

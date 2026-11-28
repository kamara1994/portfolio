import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { certs, experiences } from '@/data'
import { agentJSON, BIG } from './llm'
import { retrieve, sourcesBlock } from './retrieve'
import { CORPUS } from './corpus'
import { safe } from '@/lib/alerts/store'

// 📄 Tailored résumé: PWEZA selects and orders ONLY verified facts for the role a visitor
// describes, and the site renders a clean one-page PDF. Certifications and jobs come
// straight from site data; the model only chooses emphasis and wording.

export type Tailored = { role: string; headline: string; summary: string; skills: string[]; projects: { name: string; bullets: string[] }[] }

const UNCONFIRMED = /10,000\+|95%\+/

export async function tailor(target: string): Promise<Tailored | null> {
  const sources = [...CORPUS.filter((p) => p.id === 'identity' || p.id === 'availability'), ...retrieve(target, 12)]
  const r = await agentJSON<any>(
    `You tailor a one-page résumé for Joseph Allan Kamara to a target role, using ONLY the SOURCES.
Never invent employers, numbers, tools, results or certifications. Lab projects stay labs. In-progress certs are not earned.
Return JSON: {"role": target role title, "headline": "under 12 words", "summary": "2 sentences tailored to the role",
"skills": [8-12 skills from the sources most relevant to the role],
"projects": [3 most relevant projects: {"name": exact project name, "bullets": [2-3 bullets under 22 words each, from the sources]}]}`,
    `TARGET ROLE / JOB POST:\n${target.slice(0, 4000)}\n\nSOURCES:\n${sourcesBlock(sources)}`,
    { model: BIG, maxTokens: 900, timeoutMs: 20000 },
  )
  if (!r || !Array.isArray(r.projects)) return null
  const s = (x: unknown, n: number) => String(x ?? '').replace(/\s*\[\d+\]/g, '').slice(0, n)
  return {
    role: s(r.role || 'Security role', 80), headline: s(r.headline, 120), summary: s(r.summary, 420),
    skills: (r.skills || []).slice(0, 12).map((x: unknown) => s(x, 40)).filter(Boolean),
    projects: r.projects.slice(0, 3).map((p: any) => ({ name: s(p.name, 60), bullets: (p.bullets || []).slice(0, 3).map((b: unknown) => s(b, 200)).filter((b: string) => !UNCONFIRMED.test(b)) })),
  }
}

export async function saveTailored(t: Tailored) {
  const id = Math.random().toString(36).slice(2, 12)
  return safe(async (r) => { await r.set(`cv:${id}`, t, { ex: 30 * 86_400 }); return id }, null)
}
export async function loadTailored(id: string) {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return null
  return safe((r) => r.get<Tailored>(`cv:${id}`), null)
}

// WinAnsi (standard PDF fonts) can't draw every character; keep it safe.
const pdfSafe = (t: string) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E -ÿ–—•…]/g, '')

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = pdfSafe(text).split(/\s+/), lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(next, size) > width && line) { lines.push(line); line = w } else line = next
  }
  if (line) lines.push(line)
  return lines
}

export async function renderPdf(t: Tailored): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Joseph Allan Kamara — Résumé (${t.role})`); doc.setAuthor('Joseph Allan Kamara')
  const page: PDFPage = doc.addPage([612, 792])
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const M = 46, W = 612 - M * 2, ink = rgb(0.08, 0.1, 0.16), mute = rgb(0.35, 0.38, 0.45), accent = rgb(0.09, 0.36, 0.62)
  let y = 792 - M
  const text = (s: string, x: number, size: number, f = reg, c = ink) => { page.drawText(pdfSafe(s), { x, y, size, font: f, color: c }) }
  const para = (s: string, size = 9.6, f = reg, c = ink, indent = 0, gap = 2.4) => { for (const l of wrap(s, f, size, W - indent)) { text(l, M + indent, size, f, c); y -= size + gap } }
  const section = (title: string) => { y -= 6; text(title.toUpperCase(), M, 9, bold, accent); y -= 4; page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.6, color: rgb(0.8, 0.84, 0.9) }); y -= 12 }

  text('Joseph Allan Kamara', M, 22, bold); y -= 16
  para(t.headline || t.role, 11, reg, accent)
  para('Rexburg, ID · open to relocation · kamarajosephallan@gmail.com · linkedin.com/in/joseph-allan-kamara · github.com/kamara1994 · josephkamara.vercel.app', 8.6, reg, mute)
  y -= 2
  section('Summary'); para(t.summary)
  section('Relevant projects')
  for (const p of t.projects) {
    text(p.name, M, 10.2, bold); y -= 13
    for (const b of p.bullets) { text('•', M + 4, 9.6); const lines = wrap(b, reg, 9.6, W - 16); lines.forEach((l, i) => { page.drawText(pdfSafe(l), { x: M + 14, y, size: 9.6, font: reg, color: ink }); y -= 12; if (i === lines.length - 1) y -= 0 }) }
    y -= 3
  }
  section('Experience')
  for (const e of experiences.slice(0, 3)) {
    text(`${e.role} — ${e.company}`, M, 10, bold); const d = pdfSafe(e.dates); page.drawText(d, { x: M + W - reg.widthOfTextAtSize(d, 9), y, size: 9, font: reg, color: mute }); y -= 13
    for (const b of e.bullets.filter((x) => !UNCONFIRMED.test(x)).slice(0, 2)) { text('•', M + 4, 9.4); for (const l of wrap(b, reg, 9.4, W - 16)) { page.drawText(pdfSafe(l), { x: M + 14, y, size: 9.4, font: reg, color: ink }); y -= 11.6 } }
    y -= 3
  }
  section('Certifications')
  para(certs.map((c) => `${c.name.replace(/ —.*$/, '')}${c.status === 'earned' ? '' : ' (in progress)'}`).join(' · '))
  section('Skills'); para(t.skills.join(' · '))
  section('Education'); para('B.S. Cybersecurity, Brigham Young University–Idaho · Expected December 2026')
  y = Math.max(y, M)
  page.drawText(pdfSafe(`Tailored for: ${t.role} · Generated from verified facts at josephkamara.vercel.app`), { x: M, y: M - 18, size: 7.2, font: reg, color: mute })
  return doc.save()
}

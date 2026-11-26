import { loadTailored, renderPdf } from '@/lib/pweza/resume'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = await loadTailored(params.id)
  if (!t) return new Response('Not found', { status: 404 })
  const pdf = await renderPdf(t)
  const name = `Joseph_Allan_Kamara_Resume_${t.role.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40)}.pdf`
  return new Response(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${name}"`, 'Cache-Control': 'private, max-age=600', 'X-Robots-Tag': 'noindex' } })
}

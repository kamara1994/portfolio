import { ImageResponse } from 'next/og'
import { readStrip } from '@/lib/alerts/strip'

// Renders the "visit map" image sent with strong-lead alerts.
export const runtime = 'nodejs'

const fmt = (ms: number) => {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60 ? `${s % 60}s` : ''}`.trim()
}
const COLORS = ['#6ED6FF', '#67DDC4', '#B2A2FF', '#FFD67E', '#FB8F7F', '#8ABFFF', '#9BE58F', '#F5A3D7']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const data = readStrip(url.searchParams.get('d'), url.searchParams.get('s'))
  if (!data) return new Response('Not found', { status: 404 })
  const total = Math.max(1, data.p.reduce((a, [, ms]) => a + ms, 0))
  const maxSec = Math.max(1, ...data.c.map(([, ms]) => ms))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,#081120,#0E1B33)', color: '#EEF3FB', padding: 48, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, color: '#8FA6C8', letterSpacing: 4 }}>VISIT MAP</div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, marginTop: 6 }}>{data.w}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: data.s >= 70 ? '#FFD67E' : '#6ED6FF' }}>{data.s}</div>
            <div style={{ display: 'flex', fontSize: 20, color: '#8FA6C8' }}>{`lead score · ${fmt(data.t)}`}</div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 20, color: '#8FA6C8', marginTop: 34, marginBottom: 12, height: 28, flexShrink: 0 }}>Time on each page</div>
        <div style={{ display: 'flex', width: '100%', height: 54, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#16233D' }}>
          {data.p.map(([, ms], i) => (
            <div key={i} style={{ width: `${Math.max(2, (ms / total) * 100)}%`, height: '100%', background: COLORS[i % COLORS.length], borderRight: '3px solid #081120' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 14 }}>
          {data.p.map(([name, ms, scroll], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginRight: 26, marginBottom: 10, fontSize: 20 }}>
              <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 4, background: COLORS[i % COLORS.length], marginRight: 8 }} />
              {`${i + 1}. ${name} · ${fmt(ms)} · ${scroll}% read`}
            </div>
          ))}
        </div>

        {data.c.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
            <div style={{ display: 'flex', fontSize: 20, color: '#8FA6C8', marginBottom: 10 }}>Sections read</div>
            {data.c.map(([label, ms], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', width: 190, fontSize: 20 }}>{label}</div>
                <div style={{ display: 'flex', width: 700, height: 18, background: '#16233D', borderRadius: 9 }}>
                  <div style={{ display: 'flex', width: `${(ms / maxSec) * 100}%`, height: '100%', background: '#67DDC4', borderRadius: 9 }} />
                </div>
                <div style={{ display: 'flex', marginLeft: 14, fontSize: 20, color: '#BFD0EA' }}>{fmt(ms)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

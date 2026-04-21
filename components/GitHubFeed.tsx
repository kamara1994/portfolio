'use client'
import { useState, useEffect } from 'react'

interface Event {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: { commits?: { message: string }[]; action?: string; ref?: string }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function eventLabel(e: Event) {
  const repo = e.repo.name.replace('kamara1994/', '')
  switch (e.type) {
    case 'PushEvent': return { icon: '⟳', text: `${repo}: ${(e.payload.commits?.[0]?.message || 'pushed code').slice(0, 50)}`, color: '#00d4ff' }
    case 'CreateEvent': return { icon: '+', text: `Created ${e.payload.ref || 'branch'} in ${repo}`, color: '#00f5d4' }
    case 'WatchEvent': return { icon: '★', text: `Starred ${repo}`, color: '#ffaa00' }
    case 'ForkEvent': return { icon: '⑂', text: `Forked ${repo}`, color: '#aa44ff' }
    default: return { icon: '·', text: `Activity in ${repo}`, color: '#8899bb' }
  }
}

const fallback = [
  { icon: '⟳', text: 'blue-x: Add PyTorch threat classifier API', color: '#00d4ff', time: '2h ago' },
  { icon: '⟳', text: 'fortress-v2: Deploy Lambda auto-isolation module', color: '#00d4ff', time: '5h ago' },
  { icon: '+', text: 'Created enterprise-networking repository', color: '#00f5d4', time: '1d ago' },
  { icon: '⟳', text: 'portfolio: Add 3D architecture visualizations', color: '#00d4ff', time: '1d ago' },
  { icon: '⟳', text: 'blue-dashboard-v3.0: Fix JSONBin data bridge', color: '#00d4ff', time: '2d ago' },
]

export default function GitHubFeed() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.github.com/users/kamara1994/events?per_page=8')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEvents(data.slice(0, 8)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="font-mono text-[11px] tracking-[2px] uppercase text-neon">Live GitHub Activity</span>
        </div>
        <a href="https://github.com/kamara1994" target="_blank" className="font-mono text-[9px] text-cyan hover:text-neon transition-colors">@kamara1994 ↗</a>
      </div>
      <div className="divide-y divide-[rgba(0,212,255,0.05)]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-[rgba(0,212,255,0.1)]" />
              <div className="h-3 bg-[rgba(0,212,255,0.08)] rounded flex-1" />
              <div className="h-3 w-12 bg-[rgba(0,212,255,0.05)] rounded" />
            </div>
          ))
        ) : events.length > 0 ? (
          events.map(e => {
            const { icon, text, color } = eventLabel(e)
            return (
              <div key={e.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[rgba(0,212,255,0.02)] transition-colors">
                <span className="font-mono text-[11px] w-4 text-center shrink-0" style={{ color }}>{icon}</span>
                <span className="font-mono text-[10px] text-muted flex-1 truncate">{text}</span>
                <span className="font-mono text-[9px] text-[rgba(0,212,255,0.3)] shrink-0">{timeAgo(e.created_at)}</span>
              </div>
            )
          })
        ) : (
          fallback.map((e, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-[rgba(0,212,255,0.02)] transition-colors">
              <span className="font-mono text-[11px] w-4 text-center shrink-0" style={{ color: e.color }}>{e.icon}</span>
              <span className="font-mono text-[10px] text-muted flex-1 truncate">{e.text}</span>
              <span className="font-mono text-[9px] text-[rgba(0,212,255,0.3)] shrink-0">{e.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

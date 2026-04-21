'use client'
import { useState, useEffect } from 'react'

interface Props {
  url: string
  title: string
  color: string
  screenshot: string
}

export default function WebsiteMockup({ url, title, color, screenshot }: Props) {
  const [rotateY, setRotateY] = useState(-15)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isDragging || isHovered) return
    const interval = setInterval(() => {
      setRotateY(r => r + 0.2)
    }, 16)
    return () => clearInterval(interval)
  }, [isDragging, isHovered])

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full"
        style={{ perspective: '1000px', height: '380px' }}
        onMouseDown={e => { setIsDragging(true); setLastX(e.clientX) }}
        onMouseMove={e => { if (!isDragging) return; setRotateY(r => r + (e.clientX - lastX) * 0.4); setLastX(e.clientX) }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseEnter={() => setIsHovered(true)}
      >
        <div style={{ width: '100%', height: '100%', transform: `rotateY(${rotateY}deg)`, transformStyle: 'preserve-3d', transition: isDragging ? 'none' : 'transform 0.05s linear', position: 'relative' }}>
          <div style={{ width: '90%', margin: '0 auto', height: '100%', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${color}44`, boxShadow: `0 0 40px ${color}33`, background: '#0a0a0a' }}>
            <div style={{ height: '36px', background: '#1a1a2e', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, height: '20px', background: '#0d0d1a', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', marginLeft: '8px' }}>
                <span style={{ fontSize: '9px', color: `${color}88`, fontFamily: 'monospace' }}>{url}</span>
              </div>
            </div>
            <div style={{ height: 'calc(100% - 36px)', position: 'relative', overflow: 'hidden' }}>
              <img src={screenshot} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isHovered ? `${color}22` : 'transparent', textDecoration: 'none', opacity: isHovered ? 1 : 0, transition: 'all 0.3s' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div style={{ padding: '10px 24px', border: `1px solid ${color}88`, borderRadius: '24px', background: `${color}22`, fontSize: '12px', fontFamily: 'monospace', color: color }}>
                  VISIT {title.toUpperCase()} ↗
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs font-mono mt-3 text-center" style={{ color: `${color}66` }}>
        Drag to rotate · Hover to visit · Auto-rotating 360°
      </p>
    </div>
  )
}
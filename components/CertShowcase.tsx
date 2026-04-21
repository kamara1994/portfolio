'use client'
import { useState, useEffect } from 'react'

const CERTS = [
  { name: 'Security+', issuer: 'CompTIA', color: '#FF0000', icon: '🛡️', status: 'earned', year: '2024' },
  { name: 'PenTest+', issuer: 'CompTIA', color: '#FF6B00', icon: '🎯', status: 'earned', year: '2024' },
  { name: 'CCNA', issuer: 'Cisco', color: '#00BCEB', icon: '🔗', status: 'earned', year: '2024' },
  { name: 'PSAA', issuer: 'TCM Security', color: '#818CF8', icon: '🔍', status: 'earned', year: '2026' },
  { name: 'AWS Security', issuer: 'Amazon Web Services', color: '#FF9900', icon: '☁️', status: 'progress', year: '2026' },
]

export default function CertShowcase() {
  const [active, setActive] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    if (isDragging) return
    const interval = setInterval(() => {
      setRotateY(r => r + 0.3)
    }, 16)
    return () => clearInterval(interval)
  }, [isDragging])

  // Auto cycle active cert
  useEffect(() => {
    const interval = setInterval(() => {
      setActive(a => (a + 1) % CERTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const cert = CERTS[active]

  return (
    <div className="w-full max-w-md">
      {/* 3D rotating cert display */}
      <div
        className="relative w-full h-64 cursor-grab active:cursor-grabbing"
        style={{ perspective: '800px' }}
        onMouseDown={e => { setIsDragging(true); setLastX(e.clientX) }}
        onMouseMove={e => { if (!isDragging) return; setRotateY(r => r + (e.clientX - lastX) * 0.5); setLastX(e.clientX) }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div style={{
          width: '100%',
          height: '100%',
          transform: `rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.016s linear',
          position: 'relative',
        }}>
          {/* Main cert card */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-72 h-44 rounded-2xl relative overflow-hidden transition-all duration-500"
              style={{
                border: `2px solid ${cert.color}44`,
                background: `linear-gradient(135deg, rgba(2,8,24,0.9), rgba(2,8,24,0.7))`,
                boxShadow: `0 0 40px ${cert.color}33, 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Glowing background */}
              <div className="absolute inset-0 opacity-20" style={{
                background: `radial-gradient(circle at 30% 30%, ${cert.color}44, transparent 60%)`,
              }} />

              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle, ${cert.color} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }} />

              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[9px] tracking-[3px] uppercase mb-1" style={{ color: cert.color }}>
                      {cert.issuer}
                    </p>
                    <p className="font-orbitron text-2xl font-black text-white">{cert.name}</p>
                  </div>
                  <span className="text-3xl">{cert.icon}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[9px] text-gray-600 tracking-wider mb-1">CREDENTIAL</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: cert.status === 'earned' ? '#00f5d4' : cert.color }} />
                      <span className="font-mono text-[10px]" style={{ color: cert.status === 'earned' ? '#00f5d4' : cert.color }}>
                        {cert.status === 'earned' ? 'VERIFIED ✓' : 'IN PROGRESS ⟳'}
                      </span>
                    </div>
                  </div>
                  <p className="font-orbitron text-3xl font-black opacity-10 text-white">{cert.year}</p>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Cert selector dots */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {CERTS.map((c, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="transition-all duration-300"
            title={c.name}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? '24px' : '8px',
                height: '8px',
                background: active === i ? c.color : 'rgba(255,255,255,0.15)',
                boxShadow: active === i ? `0 0 8px ${c.color}` : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* Cert name below */}
      <div className="text-center mt-3">
        <p className="font-orbitron text-sm font-bold" style={{ color: cert.color }}>{cert.name}</p>
        <p className="font-mono text-[10px] text-muted mt-0.5">{cert.issuer} · {cert.year}</p>
        <p className="font-mono text-[9px] text-muted/50 mt-2">Drag to rotate · Click dots to switch</p>
      </div>
    </div>
  )
}
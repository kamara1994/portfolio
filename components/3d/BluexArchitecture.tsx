'use client'
import { useState, useEffect } from 'react'

const pipeline = [
  { id: 'zeek', label: 'Zeek', sub: 'Traffic Capture', color: '#00d4ff', info: 'Zeek 8.1.1 captures all network traffic — DNS, HTTP, SSL, SSH logged as JSON in real time on Mac M3' },
  { id: 's3', label: 'AWS S3', sub: 'Log Storage', color: '#ffaa00', info: 'Python log shipper automatically uploads Zeek logs to S3, organized by date and hour' },
  { id: 'lambda', label: 'Lambda', sub: 'Log Parser', color: '#00ff88', info: 'Lambda reads each log file, detects threat patterns, stores findings in DynamoDB' },
  { id: 'pytorch', label: 'PyTorch AI', sub: '99.98% Accuracy', color: '#ff4444', info: 'Custom neural network — 4 layers, 50,000 training samples, classifies 5 attack types' },
  { id: 'telegram', label: 'BLUE-X Agent', sub: 'AI Alerts', color: '#aa44ff', info: 'Claude-powered Telegram bot with secret code auth — delivers full threat analysis' },
]

const threats = ['DDoS Attack', 'SSH BruteForce', 'Port Scan', 'Botnet C2']

export default function BluexArchitecture() {
  const [active, setActive] = useState<string | null>(null)
  const [simStep, setSimStep] = useState(-1)
  const [threatLabel, setThreatLabel] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const [rotateX, setRotateX] = useState(-8)
  const [isDragging, setIsDragging] = useState(false)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const run = () => {
      setThreatLabel('')
      let i = 0
      const step = setInterval(() => {
        setSimStep(i)
        if (i === pipeline.length - 1) {
          clearInterval(step)
          const threat = threats[Math.floor(Math.random() * threats.length)]
          setThreatLabel(`🚨 ${threat} — 99.98% confidence → Telegram alert sent`)
          setTimeout(() => {
            setSimStep(-1)
            setThreatLabel('')
          }, 2500)
        }
        i++
      }, 700)
    }

    run()
    const interval = setInterval(run, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastY(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const delta = e.clientY - lastY
    setRotateX(r => Math.max(-30, Math.min(30, r + delta * 0.3)))
    setLastY(e.clientY)
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-lg border border-purple-500/20 bg-[#020814] p-6 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ perspective: '600px' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #aa44ff 1px, transparent 1px)', backgroundSize: '25px 25px' }} />

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[9px] font-mono text-purple-400">AI PIPELINE ACTIVE</span>
        </div>

        <div style={{
          transform: `rotateX(${rotateX}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}>
          <div className="relative flex items-center justify-between gap-2 mt-4">
            {pipeline.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2 flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActive(active === node.id ? null : node.id)
                    setInfo(active === node.id ? null : node.info)
                  }}
                  className="flex flex-col items-center gap-2 flex-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-500"
                    style={{
                      borderColor: node.color,
                      backgroundColor: simStep === i ? `${node.color}44` : `${node.color}11`,
                      boxShadow: simStep === i ? `0 0 30px ${node.color}99` : active === node.id ? `0 0 12px ${node.color}44` : 'none',
                      transform: simStep === i ? 'scale(1.25) translateZ(20px)' : active === node.id ? 'scale(1.1)' : 'scale(1)',
                    }}>
                    <div className="w-4 h-4 rounded transition-all duration-300"
                      style={{ backgroundColor: node.color, opacity: simStep === i ? 1 : 0.5 }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono" style={{ color: node.color }}>{node.label}</p>
                    <p className="text-[8px] text-slate-500">{node.sub}</p>
                  </div>
                </button>

                {i < pipeline.length - 1 && (
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-5 h-0.5 transition-all duration-500"
                      style={{
                        backgroundColor: simStep === i ? node.color : '#ffffff11',
                        boxShadow: simStep === i ? `0 0 10px ${node.color}` : 'none'
                      }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {threatLabel && (
            <div className="mt-4 p-2 rounded border border-purple-500/30 bg-purple-500/5 transition-all">
              <p className="text-xs font-mono text-purple-300">{threatLabel}</p>
            </div>
          )}

          {!threatLabel && (
            <div className="mt-4 p-2 rounded border border-purple-500/10">
              <p className="text-xs font-mono text-slate-600">Monitoring network traffic... Drag to tilt · Click nodes to inspect</p>
            </div>
          )}
        </div>
      </div>

      {info && (
        <div className="mt-3 p-3 rounded border bg-[#020814] transition-all"
          style={{ borderColor: `${pipeline.find(n => n.id === active)?.color}44` }}>
          <p className="font-mono text-xs uppercase tracking-wider mb-1"
            style={{ color: pipeline.find(n => n.id === active)?.color }}>
            {pipeline.find(n => n.id === active)?.label}
          </p>
          <p className="text-sm text-slate-300">{info}</p>
        </div>
      )}
    </div>
  )
}

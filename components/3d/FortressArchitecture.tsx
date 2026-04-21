'use client'
import { useState, useEffect } from 'react'

const nodes = [
  { id: 'vpc', label: 'VPC', x: 50, y: 45, color: '#00d4ff', info: 'Virtual Private Cloud — isolated network with public and private subnets segmented for security' },
  { id: 'guardduty', label: 'GuardDuty', x: 20, y: 20, color: '#ff4444', info: 'ML-based threat detection — monitors CloudTrail, VPC Flow Logs, and DNS for malicious activity' },
  { id: 'cloudtrail', label: 'CloudTrail', x: 80, y: 20, color: '#ffaa00', info: 'Records every AWS API call — the security camera of your entire account with 90-day retention' },
  { id: 'lambda', label: 'Lambda', x: 20, y: 70, color: '#00ff88', info: 'Auto-isolates compromised EC2 instances within seconds — no human intervention needed' },
  { id: 'waf', label: 'WAF', x: 80, y: 70, color: '#aa44ff', info: 'Web Application Firewall — blocks SQL injection, rate limits 2000+ req/5min, common attack patterns' },
  { id: 'sns', label: 'SNS Alerts', x: 50, y: 10, color: '#ff88aa', info: 'Real-time email alerts — fires within seconds of GuardDuty detecting a medium+ severity finding' },
  { id: 's3', label: 'S3 Logs', x: 50, y: 80, color: '#44aaff', info: 'Stores all CloudTrail logs encrypted — forensic investigation ready' },
]

const connections = [
  ['vpc', 'guardduty'], ['vpc', 'cloudtrail'], ['vpc', 'waf'],
  ['guardduty', 'lambda'], ['guardduty', 'sns'], ['cloudtrail', 's3'], ['lambda', 'sns'],
]

const attackSequences = [
  ['guardduty', 'lambda', 'sns'],
  ['cloudtrail', 's3', 'vpc'],
  ['waf', 'vpc', 'guardduty'],
]

export default function FortressArchitecture() {
  const [active, setActive] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<string[]>([])
  const [info, setInfo] = useState<string | null>(null)
  const [seqIndex, setSeqIndex] = useState(0)
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

  useEffect(() => {
    const interval = setInterval(() => {
      const seq = attackSequences[seqIndex % attackSequences.length]
      let i = 0
      const step = setInterval(() => {
        if (i < seq.length) {
          setHighlighted(seq.slice(0, i + 1))
          i++
        } else {
          clearInterval(step)
          setTimeout(() => {
            setHighlighted([])
            setSeqIndex(s => s + 1)
          }, 800)
        }
      }, 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [seqIndex])

  const getNode = (id: string) => nodes.find(n => n.id === id)!

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const delta = e.clientX - lastX
    setRotateY(r => r + delta * 0.5)
    setLastX(e.clientX)
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="w-full">
      <div
        className="relative w-full h-[380px] rounded-lg border border-cyan-500/20 bg-[#020814] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="absolute inset-0" style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            transform: `rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.016s linear',
          }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {connections.map(([from, to], i) => {
                const f = getNode(from)
                const t = getNode(to)
                const isActive = highlighted.includes(from) && highlighted.includes(to)
                return (
                  <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke={isActive ? f.color : '#00d4ff'}
                    strokeWidth={isActive ? '0.6' : '0.2'}
                    strokeOpacity={isActive ? 0.9 : 0.12}
                    style={{ transition: 'all 0.4s' }}
                  />
                )
              })}
            </svg>

            {nodes.map(node => {
              const isHighlighted = highlighted.includes(node.id)
              const isActive = active === node.id
              return (
                <button key={node.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActive(active === node.id ? null : node.id)
                    setInfo(active === node.id ? null : node.info)
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="relative flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                      style={{
                        borderColor: node.color,
                        backgroundColor: isHighlighted || isActive ? `${node.color}33` : `${node.color}11`,
                        boxShadow: isHighlighted ? `0 0 25px ${node.color}99` : isActive ? `0 0 15px ${node.color}66` : `0 0 4px ${node.color}22`,
                        transform: isHighlighted ? 'scale(1.4)' : isActive ? 'scale(1.2)' : 'scale(1)',
                      }}>
                      <div className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: node.color,
                          opacity: isHighlighted ? 1 : 0.6,
                        }} />
                    </div>
                    <span className="text-[9px] font-mono whitespace-nowrap" style={{ color: node.color }}>
                      {node.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-mono text-green-400">LIVE MONITORING</span>
        </div>

        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-cyan-500/40">
          FORTRESS v2 — Drag to rotate · Click nodes to inspect
        </div>
      </div>

      {info && (
        <div className="mt-3 p-3 rounded border bg-[#020814] transition-all"
          style={{ borderColor: `${nodes.find(n => n.id === active)?.color}44` }}>
          <p className="font-mono text-xs uppercase tracking-wider mb-1"
            style={{ color: nodes.find(n => n.id === active)?.color }}>
            {nodes.find(n => n.id === active)?.label}
          </p>
          <p className="text-sm text-slate-300">{info}</p>
        </div>
      )}
    </div>
  )
}

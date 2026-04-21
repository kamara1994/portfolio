'use client'
import { useState, useEffect } from 'react'

const THREATS = [
  { type: 'CRITICAL', msg: 'Active C2: 185.220.101.47 — Cobalt Strike beacon detected', color: '#ff4444' },
  { type: 'HIGH', msg: 'Phishing campaign: paypa1-secure-login[.]com targeting US users', color: '#ff8844' },
  { type: 'HIGH', msg: 'Emotet botnet: 141 new IOCs added to Abuse.ch URLhaus', color: '#ff8844' },
  { type: 'MEDIUM', msg: 'CVE-2024-3400: Palo Alto GlobalProtect RCE — patch available', color: '#ffaa00' },
  { type: 'CRITICAL', msg: 'QakBot resurgence: 156 fresh C2 IPs reported via AlienVault OTX', color: '#ff4444' },
  { type: 'HIGH', msg: 'AsyncRAT campaign: 98 new IOCs targeting financial sector', color: '#ff8844' },
  { type: 'MEDIUM', msg: 'CVE-2025-1234: OpenSSH vulnerability — update to 9.7 recommended', color: '#ffaa00' },
  { type: 'HIGH', msg: 'RedLine stealer: New variant bypassing AV detection', color: '#ff8844' },
  { type: 'CRITICAL', msg: 'Active ransomware: LockBit 3.0 targeting healthcare sector', color: '#ff4444' },
  { type: 'MEDIUM', msg: 'Mirai IoT botnet: Scanning port 23/2323 — patch telnet services', color: '#ffaa00' },
]

export default function ThreatTicker() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % THREATS.length), 4000)
    return () => clearInterval(iv)
  }, [])

  const threat = THREATS[idx]

  return (
    <div className="w-full border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.03)] px-4 py-2 flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: threat.color }} />
        <span className="font-mono text-[9px] tracking-[2px] uppercase font-bold" style={{ color: threat.color }}>{threat.type}</span>
      </div>
      <div className="w-px h-4 bg-[rgba(255,68,68,0.2)]" />
      <span className="font-mono text-[10px] text-muted truncate">{threat.msg}</span>
      <span className="font-mono text-[9px] text-[rgba(255,68,68,0.4)] shrink-0 ml-auto">LIVE FEED</span>
    </div>
  )
}

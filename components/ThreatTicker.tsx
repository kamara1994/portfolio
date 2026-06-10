'use client'
import { useEffect, useState } from 'react'

const ROW_1 = [
  { type: 'CRITICAL', msg: 'Active C2: 185.220.101.47 — Cobalt Strike beacon detected', color: '#ff4444' },
  { type: 'HIGH',     msg: 'Phishing campaign: paypa1-secure-login[.]com targeting US users', color: '#ff7744' },
  { type: 'CRITICAL', msg: 'QakBot resurgence: 156 fresh C2 IPs reported via AlienVault OTX', color: '#ff4444' },
  { type: 'HIGH',     msg: 'AsyncRAT: 98 new IOCs targeting financial sector', color: '#ff7744' },
  { type: 'CRITICAL', msg: 'LockBit 3.0: Active ransomware targeting healthcare sector', color: '#ff4444' },
  { type: 'HIGH',     msg: 'RedLine stealer: New variant bypassing AV detection', color: '#ff7744' },
  { type: 'CRITICAL', msg: 'Emotet botnet: 141 new IOCs added to Abuse.ch URLhaus', color: '#ff4444' },
]

const ROW_2 = [
  { type: 'MEDIUM', msg: 'CVE-2024-3400: Palo Alto GlobalProtect RCE — patch available',       color: '#ffaa00' },
  { type: 'MEDIUM', msg: 'CVE-2025-1234: OpenSSH vulnerability — update to 9.7 recommended',   color: '#ffaa00' },
  { type: 'LOW',    msg: 'Mirai IoT botnet: Scanning port 23/2323 — patch telnet services',     color: '#84cc16' },
  { type: 'MEDIUM', msg: 'Brute force surge: 45k+ SSH probes from AS8075 in last 24h',          color: '#ffaa00' },
  { type: 'LOW',    msg: 'Exposed RDP: 3.2M endpoints still on port 3389 — restrict access',    color: '#84cc16' },
  { type: 'MEDIUM', msg: 'Supply chain: 12 malicious npm packages removed, check dependencies', color: '#ffaa00' },
]

function MarqueeRow({
  items,
  direction,
  speed,
}: {
  items: typeof ROW_1
  direction: 'left' | 'right'
  speed: number
}) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <div
        className="flex items-center gap-0 w-max"
        style={{ animation: `ttTicker${direction === 'left' ? 'L' : 'R'} ${speed}s linear infinite` }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-2 px-5 shrink-0">
            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: t.color }} />
            <span className="font-mono font-black tracking-[1.5px]" style={{ fontSize: 8, color: t.color }}>
              {t.type}
            </span>
            <span className="font-mono text-muted" style={{ fontSize: 9 }}>
              {t.msg}
            </span>
            <span className="mx-3 opacity-20" style={{ color: t.color }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ThreatTicker() {
  const [time, setTime] = useState('')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    update()
    const iv = setInterval(update, 1000)
    // Slowly increment threat counter for dramatic effect
    const base = Math.floor(Math.random() * 40) + 120
    setCount(base)
    const inc = setInterval(() => setCount(c => c + Math.floor(Math.random() * 2)), 8000)
    return () => { clearInterval(iv); clearInterval(inc) }
  }, [])

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderTop:    '1px solid rgba(255,68,68,0.18)',
        borderBottom: '1px solid rgba(255,68,68,0.18)',
        background:   'rgba(255,20,20,0.025)',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-4 px-4 py-1 border-b border-[rgba(255,68,68,0.1)]">
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="w-2 h-2 rounded-full bg-[#ff4444]"
            style={{ boxShadow: '0 0 6px #ff4444', animation: 'ttPulse 1.2s ease-in-out infinite' }}
          />
          <span className="font-mono font-black tracking-[3px] uppercase" style={{ fontSize: 8, color: '#ff4444' }}>
            THREAT INTEL FEED
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-mono" style={{ fontSize: 8, color: 'rgba(255,68,68,0.45)' }}>
            {count} THREATS TRACKED TODAY
          </span>
          <span className="font-mono opacity-30" style={{ fontSize: 8, color: '#ff4444' }}>|</span>
          <span className="font-mono" style={{ fontSize: 8, color: 'rgba(255,68,68,0.45)' }}>{time}</span>
        </div>
      </div>

      {/* Row 1 — CRITICAL/HIGH scrolling left */}
      <div className="py-[5px] border-b border-[rgba(255,68,68,0.07)]">
        <MarqueeRow items={ROW_1} direction="left" speed={45} />
      </div>

      {/* Row 2 — MEDIUM/LOW scrolling right */}
      <div className="py-[5px]">
        <MarqueeRow items={ROW_2} direction="right" speed={55} />
      </div>

      <style>{`
        @keyframes ttTickerL {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ttTickerR {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes ttPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

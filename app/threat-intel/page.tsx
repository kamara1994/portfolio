'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'

const malwareFamilies = [
  { name: 'QakBot',        type: 'Banking Trojan',  iocs: 156, sev: 'CRITICAL', color: '#f43f5e' },
  { name: 'Cobalt Strike', type: 'C2 Framework',    iocs: 134, sev: 'CRITICAL', color: '#f43f5e' },
  { name: 'Emotet',        type: 'Botnet/Loader',   iocs: 141, sev: 'HIGH',     color: '#f97316' },
  { name: 'AsyncRAT',      type: 'Remote Access',   iocs: 98,  sev: 'HIGH',     color: '#f97316' },
  { name: 'RedLine',       type: 'Infostealer',     iocs: 87,  sev: 'HIGH',     color: '#f97316' },
  { name: 'IcedID',        type: 'Banking Trojan',  iocs: 76,  sev: 'HIGH',     color: '#f97316' },
  { name: 'Mirai',         type: 'IoT Botnet',      iocs: 54,  sev: 'MEDIUM',   color: '#eab308' },
  { name: 'FormBook',      type: 'Infostealer',     iocs: 43,  sev: 'MEDIUM',   color: '#eab308' },
]

const c2Servers = [
  { ip: '185.220.101.47', type: 'Tor Exit Node',    country: 'RU', malware: 'Cobalt Strike', status: 'ACTIVE' },
  { ip: '194.165.16.78',  type: 'Known C2',         country: 'UA', malware: 'QakBot',        status: 'ACTIVE' },
  { ip: '45.142.212.100', type: 'Bulletproof Host', country: 'NL', malware: 'AsyncRAT',      status: 'ACTIVE' },
  { ip: '91.219.236.166', type: 'Malware Host',     country: 'RU', malware: 'Emotet',        status: 'ACTIVE' },
  { ip: '185.234.218.23', type: 'Phishing Host',    country: 'DE', malware: 'RedLine',       status: 'ACTIVE' },
  { ip: '103.75.190.12',  type: 'C2 Server',        country: 'SG', malware: 'IcedID',        status: 'ACTIVE' },
]

const phishingDomains = [
  { domain: 'paypa1-secure-login[.]com',      campaign: 'PayPal Phish',   detected: '2h ago' },
  { domain: 'microsoft-account-verify[.]net', campaign: 'Microsoft Phish', detected: '4h ago' },
  { domain: 'chase-bank-secure[.]info',       campaign: 'Chase Phish',    detected: '6h ago' },
  { domain: 'amazon-order-update[.]co',       campaign: 'Amazon Phish',   detected: '8h ago' },
  { domain: 'netflix-billing-update[.]xyz',   campaign: 'Netflix Phish',  detected: '12h ago' },
  { domain: 'apple-id-locked[.]com',          campaign: 'Apple Phish',    detected: '15h ago' },
]

function StatCard({ label, value, sub, color }: { label: string, value: string, sub?: string, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
      <div className="font-mono text-[9px] text-muted tracking-[2px] uppercase mb-2">{label}</div>
      <div className="font-orbitron text-3xl font-black mb-1" style={{ color }}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-muted">{sub}</div>}
    </motion.div>
  )
}

export default function ThreatIntelDashboard() {
  const [time, setTime] = useState('')
  const [iocCount, setIocCount] = useState(1315)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setIocCount(prev => prev + Math.floor(Math.random() * 3))
      setPulse(true)
      setTimeout(() => setPulse(false), 500)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="relative min-h-screen bg-[#020818]">
      <GlowOrbs />
      <Nav />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="font-mono text-[10px] text-muted tracking-[3px] uppercase mb-2">Live Dashboard</div>
              <h1 className="font-orbitron text-3xl md:text-4xl font-black text-[#e2eaff]">
                Threat Intelligence <span className="text-cyan">Feed</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="terminal-box px-4 py-2">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-neon animate-pulse-slow" />
                  <span className="text-neon">LIVE</span>
                  <span className="text-muted ml-2">{time}</span>
                </div>
              </div>
              <div className="font-mono text-[10px] text-muted border border-[rgba(0,212,255,0.15)] px-3 py-2">
                Next refresh: 15:00
              </div>
            </div>
          </div>

          {/* FEEDS STATUS */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { name: 'AlienVault OTX', count: '847 IOCs', status: 'LIVE' },
              { name: 'Abuse.ch URLhaus', count: '312 IOCs', status: 'LIVE' },
              { name: 'Feodo Tracker', count: '156 IOCs', status: 'LIVE' },
            ].map(feed => (
              <div key={feed.name} className="flex items-center gap-2 glass-card px-4 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-slow" />
                <span className="font-mono text-[10px] text-[#e2eaff]">{feed.name}</span>
                <span className="font-mono text-[10px] text-cyan">{feed.count}</span>
                <span className="font-mono text-[9px] text-neon">{feed.status}</span>
              </div>
            ))}
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total IOCs" value={iocCount.toLocaleString()} sub={pulse ? '+2 new' : 'collected'} color="#00d4ff" />
            <StatCard label="Active C2s" value="6" sub="live servers" color="#f43f5e" />
            <StatCard label="Phishing Domains" value="8" sub="last 24h" color="#f97316" />
            <StatCard label="Threat Level" value="HIGH" sub="updated now" color="#f43f5e" />
          </div>

          {/* TWO COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* MALWARE FAMILIES */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
              <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
                <div className="font-mono text-[11px] tracking-[3px] uppercase text-neon">Top Malware Families</div>
                <div className="font-mono text-[9px] text-muted">Last 24h</div>
              </div>
              <div className="p-4 space-y-2">
                {malwareFamilies.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-muted w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold" style={{ color: m.color }}>{m.name}</span>
                        <span className="font-mono text-[9px] text-muted">{m.iocs} IOCs</span>
                      </div>
                      <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(m.iocs / 156) * 100}%`, background: m.color, opacity: 0.7 }} />
                      </div>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5" style={{ color: m.color, border: `1px solid ${m.color}44` }}>{m.sev}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* C2 SERVERS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card">
              <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
                <div className="font-mono text-[11px] tracking-[3px] uppercase text-neon">Active C2 Servers</div>
                <span className="font-mono text-[9px] text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-slow" />
                  LIVE
                </span>
              </div>
              <div className="divide-y divide-[rgba(0,212,255,0.06)]">
                {c2Servers.map(server => (
                  <div key={server.ip} className="px-6 py-3 flex items-center justify-between hover:bg-[rgba(244,63,94,0.03)] transition-colors">
                    <div>
                      <div className="font-mono text-[11px] text-red-400 font-bold">{server.ip}</div>
                      <div className="font-mono text-[9px] text-muted">{server.type} · {server.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-[#e2eaff]">{server.malware}</div>
                      <div className="font-mono text-[9px] text-neon">{server.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* PHISHING DOMAINS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
              <div className="font-mono text-[11px] tracking-[3px] uppercase text-neon">Active Phishing Domains</div>
              <div className="font-mono text-[9px] text-muted">{phishingDomains.length} detected</div>
            </div>
            <div className="divide-y divide-[rgba(0,212,255,0.06)]">
              {phishingDomains.map(d => (
                <div key={d.domain} className="px-6 py-3 flex items-center justify-between hover:bg-[rgba(234,179,8,0.03)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-yellow-400">⚠</span>
                    <div>
                      <div className="font-mono text-[11px] text-yellow-300">{d.domain}</div>
                      <div className="font-mono text-[9px] text-muted">{d.campaign}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[9px] text-muted">{d.detected}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* EXPORT */}
          <div className="mt-6 flex flex-wrap gap-3">
            {['Export JSON', 'STIX 2.0 Bundle', 'Firewall Blocklist', 'PDF Report'].map(btn => (
              <button key={btn}
                className="btn-hex border border-[rgba(0,212,255,0.25)] text-muted font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 hover:border-cyan hover:text-cyan transition-all">
                {btn}
              </button>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
'use client'
// @ts-nocheck
import { motion } from 'framer-motion'

const highlights = [
  { icon: '🎓', label: 'Certified',         color: '#00d4ff', value: 'Security+ · PenTest+ · CCNA · PSAA · AWS Security (in progress)' },
  { icon: '🔵', label: 'Flagship Project',  color: '#00f5d4', value: 'BLUE SOC — Splunk → n8n → AI-assisted triage → Palo Alto workflow → Telegram alerting' },
  { icon: '☁️', label: 'Cloud Security',    color: '#ffaa00', value: 'FORTRESS v2 — AWS GuardDuty, Terraform IaC, Lambda remediation, 5 attack simulations' },
  { icon: '🤖', label: 'AI Security',       color: '#a855f7', value: 'BLUE-X — PyTorch threat classifier, 50k samples, 99.98% accuracy on controlled dataset' },
  { icon: '🎯', label: 'Target Roles',      color: '#818cf8', value: 'SOC Analyst · Security Engineer · Cloud Security · AI Security' },
]

/* ── LED edge ── */
function LedEdge({ position = 'top', colors = ['#00d4ff', '#00f5d4', '#818cf8'], width = 88, speed = 6, blur = 3 }) {
  const isTop = position === 'top'
  const inset = `${(100 - width) / 2}%`
  return (
    <>
      <div style={{
        position: 'absolute', [isTop ? 'top' : 'bottom']: -3, left: inset, right: inset, height: 6,
        background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 25%, ${colors[1]} 50%, ${colors[2]} 75%, transparent 100%)`,
        filter: `blur(${blur}px)`, opacity: 0.6, pointerEvents: 'none', zIndex: 1,
      }} />
      <motion.div
        animate={{ backgroundPositionX: ['0%', '200%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', [isTop ? 'top' : 'bottom']: 0, left: inset, right: inset, height: 1.4,
          background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]}, ${colors[1]}, transparent)`,
          backgroundSize: '200% 100%',
          boxShadow: `0 0 6px ${colors[0]}, 0 0 14px ${colors[0]}66`,
          pointerEvents: 'none', borderRadius: 1, zIndex: 2,
        }}
      />
    </>
  )
}

/* ── Glass action button ── */
function GlassBtn({ href, target, primary, accent = '#00d4ff', accent2 = '#00f5d4', pulse, children, idx = 0 }) {
  return (
    <motion.a
      href={href} target={target}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateY: idx % 2 === 0 ? -3 : 3, rotateX: 2 }}
      viewport={{ once: true }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.07, y: -4 }}
      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden font-mono font-black inline-flex items-center gap-2 cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
        padding: '11px 20px', color: primary ? '#02101f' : '#fff',
        background: primary
          ? `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`
          : `linear-gradient(135deg, ${accent}26 0%, ${accent2}10 50%, rgba(0,0,0,0.25) 100%)`,
        backdropFilter: 'blur(16px) saturate(200%)',
        WebkitBackdropFilter: 'blur(16px) saturate(200%)',
        border: `1.4px solid ${primary ? accent2 : accent + '66'}`,
        borderRadius: 10,
        boxShadow: primary
          ? `inset 0 1.5px 0 rgba(255,255,255,0.55), 0 12px 26px rgba(0,0,0,0.45), 0 0 30px ${accent}55`
          : `inset 0 1.5px 0 rgba(255,255,255,0.3), 0 8px 20px rgba(0,0,0,0.4), 0 0 16px ${accent}33`,
      }}
    >
      <LedEdge position="top"    colors={[accent, '#fff', accent2]} width={80} speed={3.5} blur={3} />
      <LedEdge position="bottom" colors={[accent2, accent, accent]} width={80} speed={4.5} blur={3} />
      {pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent2, boxShadow: `0 0 8px ${accent2}`, animation: 'briefPulse 1.5s ease-in-out infinite' }} />}
      <span className="relative" style={{ zIndex: 3 }}>{children}</span>
    </motion.a>
  )
}

export default function RecruiterBriefing() {
  return (
    <section id="briefing" className="px-6 py-20 relative">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 font-mono text-[10px] text-neon tracking-[4px] uppercase mb-3">
            <span className="w-8 h-px bg-neon" /> Recruiter Briefing
          </div>
          <h2 className="font-orbitron font-bold text-2xl text-[#e2eaff] mb-2">Why Joseph for a Security Role?</h2>
          <p className="font-mono text-[11px] text-muted tracking-[2px] mb-10 opacity-60 uppercase">
            CANDIDATE BRIEF // UNCLASSIFIED // 30-SECOND OVERVIEW
          </p>

          {/* Main floating glass panel */}
          <div
            className="relative p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.4) 100%)',
              backdropFilter: 'blur(22px) saturate(180%)',
              WebkitBackdropFilter: 'blur(22px) saturate(180%)',
              border: '1.4px solid rgba(0,212,255,0.25)',
              borderRadius: 14,
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.3), 0 24px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.15)',
            }}
          >
            <LedEdge position="top"    colors={['#00d4ff', '#fff',    '#00f5d4']} width={92} speed={6} blur={3} />
            <LedEdge position="bottom" colors={['#818cf8', '#a855f7', '#00d4ff']} width={92} speed={7} blur={3} />

            {/* Corner accents */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 opacity-70" style={{ borderColor: 'rgba(0,212,255,0.7)' }} />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 opacity-70" style={{ borderColor: 'rgba(0,212,255,0.7)' }} />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 opacity-70" style={{ borderColor: 'rgba(0,212,255,0.7)' }} />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 opacity-70" style={{ borderColor: 'rgba(0,212,255,0.7)' }} />

            {/* Highlights */}
            <div className="space-y-3 relative" style={{ zIndex: 3 }}>
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  whileHover={{ x: 4 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative overflow-hidden flex gap-4 items-start p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
                    border: `1px solid ${h.color}22`, borderRadius: 9,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                >
                  <LedEdge position="top" colors={[h.color, h.color, h.color]} width={70} speed={7} blur={2} />
                  <span className="text-lg mt-0.5 shrink-0" style={{ filter: `drop-shadow(0 0 6px ${h.color}66)`, position: 'relative', zIndex: 3 }}>{h.icon}</span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 relative" style={{ zIndex: 3 }}>
                    <span className="font-mono font-bold tracking-[2px] uppercase shrink-0 sm:w-28" style={{ fontSize: 9.5, color: h.color, textShadow: `0 0 6px ${h.color}55` }}>
                      {h.label}
                    </span>
                    <span className="text-[#c8d4e2] text-sm leading-relaxed">{h.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-[rgba(0,212,255,0.1)] relative" style={{ zIndex: 3, perspective: 1400 }}>
              <GlassBtn href="/resume/Joseph_Allan_Kamara_Resume_v3.pdf" target="_blank" primary accent="#00d4ff" accent2="#00f5d4" idx={0}>↓ Download Resume</GlassBtn>
              <GlassBtn href="/blue-soc-brief"  target="_blank" accent="#a855f7" accent2="#818cf8" idx={1}>↓ BLUE SOC Brief</GlassBtn>
              <GlassBtn href="#projects"                        accent="#00d4ff" accent2="#818cf8" idx={2}>Explore BLUE SOC</GlassBtn>
              <GlassBtn href="/incident-replay"                 accent="#00f5d4" accent2="#a855f7" pulse idx={3}>Incident Lab</GlassBtn>
              <GlassBtn href="https://github.com/kamara1994" target="_blank" accent="#818cf8" accent2="#00d4ff" idx={4}>View GitHub</GlassBtn>
              <GlassBtn href="#contact"                         accent="#00f5d4" accent2="#00d4ff" idx={5}>Contact Joseph</GlassBtn>
            </div>
          </div>
        </motion.div>

      </div>

      <style>{`
        @keyframes briefPulse { 0%, 100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}</style>
    </section>
  )
}

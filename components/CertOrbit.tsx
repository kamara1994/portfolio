'use client'
// @ts-nocheck
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CERTS = [
  {
    name: 'Security+',
    fullName: 'CompTIA Security+',
    issuer: 'CompTIA',
    date: 'Active Certification',
    status: 'earned',
    image: '/images/cert-securityplus.png',
    color: '#FF4444',
    description: 'Validates baseline cybersecurity skills including threat detection, risk management, network security, cryptography, and compliance fundamentals.',
    certNum: null,
    verifyUrl: 'https://www.certmetrics.com/comptia/public/verification.aspx',
  },
  {
    name: 'PenTest+',
    fullName: 'CompTIA PenTest+',
    issuer: 'CompTIA',
    date: 'Active Certification',
    status: 'earned',
    image: '/images/cert-pentest.png',
    color: '#FF8C00',
    description: 'Validates penetration testing skills including planning, vulnerability scanning, exploitation, and professional reporting.',
    certNum: null,
    verifyUrl: 'https://www.certmetrics.com/comptia/public/verification.aspx',
  },
  {
    name: 'CCNA',
    fullName: 'Cisco Certified Network Associate',
    issuer: 'Cisco',
    date: 'Active Certification',
    status: 'earned',
    image: '',
    color: '#00BCEB',
    description: 'Validates skills in network fundamentals, IP connectivity, routing protocols, VLANs, security fundamentals, and automation.',
    certNum: null,
    verifyUrl: 'https://cp.certmetrics.com/cisco/en/public/verify',
  },
  {
    name: 'PSAA',
    fullName: 'Practical SOC Analyst Associate',
    issuer: 'TCM Security',
    date: 'March 26, 2026',
    status: 'earned',
    image: '/images/cert-psaa.png',
    color: '#818CF8',
    description: 'Hands-on SOC analyst certification covering threat detection, alert triage, SIEM operations, and real-world security investigations.',
    certNum: '#178154778',
    verifyUrl: 'https://certifications.tcm-sec.com/verify',
  },
  {
    name: 'AWS',
    fullName: 'AWS Certified Security – Specialty',
    issuer: 'Amazon Web Services',
    date: 'In Progress · 2026',
    status: 'progress',
    image: '/images/cert-aws.png',
    color: '#FF9900',
    description: 'Advanced AWS security covering GuardDuty, Security Hub, IAM, KMS, CloudTrail, WAF, and incident response on AWS infrastructure.',
    certNum: null,
    verifyUrl: 'https://aws.amazon.com/certification/certified-security-specialty/',
  },
]

/* Each cert's orbital ring parameters */
const ORBITS = [
  { radius: 178, speed:  0.0070, inclineDeg:  14, phase: 0                  },
  { radius: 162, speed: -0.0052, inclineDeg: -22, phase: (Math.PI * 2) / 5  },
  { radius: 184, speed:  0.0060, inclineDeg:  30, phase: (Math.PI * 4) / 5  },
  { radius: 167, speed: -0.0080, inclineDeg: -10, phase: (Math.PI * 6) / 5  },
  { radius: 174, speed:  0.0055, inclineDeg:  20, phase: (Math.PI * 8) / 5  },
]

const CARD_W = 112
const CARD_H = 144

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function CertOrbit() {
  const sceneRef  = useRef<HTMLDivElement>(null)
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null])
  const animRef   = useRef<number>()
  const anglesRef = useRef<number[]>(ORBITS.map(o => o.phase))
  const rotRef    = useRef({ x: -22, y: 25 })
  const dragRef   = useRef({ on: false, lx: 0, ly: 0, vx: 0, vy: 0 })
  const selRef    = useRef<number | null>(null)

  const [selected, setSelected] = useState<number | null>(null)

  /* Keep ref in sync without restarting the RAF */
  useEffect(() => { selRef.current = selected }, [selected])

  /* ── Main RAF animation loop ── */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const tick = () => {
      const sel = selRef.current

      /* Advance orbital angles (skip selected cert) */
      for (let i = 0; i < ORBITS.length; i++) {
        if (i !== sel) anglesRef.current[i] += ORBITS[i].speed
      }

      /* Inertia decay after drag release */
      if (!dragRef.current.on) {
        dragRef.current.vx *= 0.93
        dragRef.current.vy *= 0.93
        rotRef.current.y  += dragRef.current.vx * 0.38
        rotRef.current.x  += dragRef.current.vy * 0.38
      }

      /* Gentle auto-rotation when idle */
      if (!dragRef.current.on && sel === null) {
        rotRef.current.y += 0.11
      }

      /* Clamp X rotation so system never flips upside-down */
      rotRef.current.x = Math.max(-55, Math.min(55, rotRef.current.x))

      /* Apply scene rotation */
      scene.style.transform =
        `rotateX(${rotRef.current.x}deg) rotateY(${rotRef.current.y}deg)`

      /* Update each cert card position */
      cardRefs.current.forEach((card, i) => {
        if (!card) return

        /* Selected card: fly toward viewer */
        if (i === sel) {
          card.style.transform = `translate3d(${-CARD_W / 2}px, ${-CARD_H / 2}px, 230px) scale(1.35)`
          card.style.opacity   = '1'
          card.style.zIndex    = '100'
          card.style.filter    = `drop-shadow(0 0 28px ${CERTS[i].color})`
          return
        }

        /* Orbital position using tilted-ring math */
        const angle  = anglesRef.current[i]
        const { radius, inclineDeg } = ORBITS[i]
        const ir = inclineDeg * Math.PI / 180

        const x =  radius * Math.cos(angle)
        const y = -radius * Math.sin(angle) * Math.sin(ir)
        const z =  radius * Math.sin(angle) * Math.cos(ir)

        /* Depth → scale & opacity (back=dim, front=bright) */
        const nz      = (z + radius) / (radius * 2)            // 0..1
        const scale   = 0.52 + nz * 0.52
        const opacity = 0.28 + nz * 0.72

        card.style.transform = `translate3d(${x - CARD_W / 2}px, ${y - CARD_H / 2}px, ${z}px) scale(${scale.toFixed(3)})`
        card.style.opacity   = opacity.toFixed(3)
        card.style.zIndex    = String(Math.round(nz * 9))
        card.style.filter    = `drop-shadow(0 2px ${(nz * 16).toFixed(0)}px ${CERTS[i].color}50)`
      })

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  /* ── Drag handlers ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { on: true, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0 }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.on) return
    const dx = e.clientX - dragRef.current.lx
    const dy = e.clientY - dragRef.current.ly
    dragRef.current.vx   = dx
    dragRef.current.vy   = -dy
    rotRef.current.y    += dx * 0.42
    rotRef.current.x    -= dy * 0.42
    dragRef.current.lx   = e.clientX
    dragRef.current.ly   = e.clientY
  }, [])

  const onMouseUp = useCallback(() => { dragRef.current.on = false }, [])

  /* ── Touch handlers (mobile support) ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    dragRef.current = { on: true, lx: t.clientX, ly: t.clientY, vx: 0, vy: 0 }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.on) return
    const t  = e.touches[0]
    const dx = t.clientX - dragRef.current.lx
    const dy = t.clientY - dragRef.current.ly
    dragRef.current.vx   = dx
    dragRef.current.vy   = -dy
    rotRef.current.y    += dx * 0.42
    rotRef.current.x    -= dy * 0.42
    dragRef.current.lx   = t.clientX
    dragRef.current.ly   = t.clientY
  }, [])

  const handleCertClick = useCallback((e: React.MouseEvent, i: number) => {
    e.stopPropagation()
    setSelected(prev => (prev === i ? null : i))
  }, [])

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div
      className="relative w-full select-none"
      style={{
        height:            560,
        perspective:       '1100px',
        perspectiveOrigin: '50% 44%',
        cursor:            'grab',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      onClick={() => setSelected(null)}
    >

      {/* ── Decorative 2-D background rings ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: 60 }}
      >
        {[118, 150, 182, 208].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  r * 2,
              height: r * 2,
              border: `1px ${i % 2 === 0 ? 'dashed' : 'solid'} rgba(0,212,255,${0.045 + i * 0.014})`,
            }}
          />
        ))}
        {/* Central glow blob */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width:      230,
            height:     230,
            background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── 3-D Scene ── */}
      <div
        ref={sceneRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d', paddingBottom: 60 }}
      >

        {/* ── Profile photo (fixed at origin) ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            width:     190,
            height:    190,
            left:      '50%',
            top:       '50%',
            transform: 'translate(-95px, -95px)',
          }}
        >
          {/* Pulsing outer rings */}
          {[1.88, 1.54].map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border:    '1px solid rgba(0,212,255,0.22)',
                transform: `scale(${s})`,
                animation: `coRingPulse ${2.4 + i * 0.9}s ease-in-out infinite ${i * 0.45}s`,
              }}
            />
          ))}

          {/* Background radial glow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,255,0.24) 0%, transparent 70%)',
              transform:  'scale(2.3)',
            }}
          />

          {/* Spinning arc — cyan */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border:          '2px solid transparent',
              borderTopColor:  '#00d4ff',
              borderRightColor:'rgba(0,245,212,0.6)',
              transform:       'scale(1.15)',
              animation:       'coSpinCW 3.2s linear infinite',
            }}
          />

          {/* Spinning arc — purple, reversed */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border:           '1.5px solid transparent',
              borderBottomColor:'rgba(129,140,248,0.55)',
              borderLeftColor:  'rgba(0,212,255,0.30)',
              transform:        'scale(1.24)',
              animation:        'coSpinCCW 4.8s linear infinite',
            }}
          />

          {/* Photo */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden"
            style={{
              border:     '2px solid rgba(0,212,255,0.55)',
              boxShadow:  '0 0 32px rgba(0,212,255,0.42), 0 0 64px rgba(0,212,255,0.10)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile/joseph.jpg"
              alt="Joseph Allan Kamara"
              className="w-full h-full object-cover object-top"
            />
            {/* Scan-line sweep */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
            >
              <div
                style={{
                  width:      '100%',
                  height:     3,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.9) 50%, transparent 100%)',
                  animation:  'coScan 2.8s linear infinite',
                }}
              />
            </div>
          </div>

          {/* Name label */}
          <div
            className="absolute left-1/2 font-mono text-cyan uppercase tracking-[3px] whitespace-nowrap"
            style={{ fontSize: 7.5, bottom: -26, transform: 'translateX(-50%)' }}
          >
            ◈ Joseph Kamara ◈
          </div>

          {/* Live indicator dot */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: '#00f5d4',
              border:     '2px solid #020818',
              bottom:     7,
              right:      7,
              boxShadow:  '0 0 8px #00f5d4',
              animation:  'coRingPulse 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Orbiting cert cards ── */}
        {CERTS.map((cert, i) => (
          <div
            key={cert.name}
            ref={el => { cardRefs.current[i] = el }}
            className="absolute"
            style={{
              left:        '50%',
              top:         '50%',
              width:       CARD_W,
              height:      CARD_H,
              cursor:      'pointer',
              willChange:  'transform, opacity',
              pointerEvents: 'auto',
            }}
            onClick={e => handleCertClick(e, i)}
          >
            <div
              className="w-full h-full rounded-xl relative overflow-hidden"
              style={{
                background:     `linear-gradient(148deg, ${cert.color}28 0%, rgba(2,8,24,0.94) 58%)`,
                border:         `1px solid ${cert.color}52`,
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Top glow bar */}
              <div
                className="absolute top-0 inset-x-0"
                style={{
                  height:     '1.5px',
                  background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)`,
                }}
              />

              {/* Image / progress area */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{ height: 70, background: `${cert.color}12` }}
              >
                {cert.status === 'progress' ? (
                  <div className="flex flex-col items-center gap-1.5 px-3 w-full">
                    <span
                      className="font-orbitron font-black"
                      style={{ fontSize: 17, color: cert.color }}
                    >
                      AWS
                    </span>
                    <div className="w-full h-0.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width:      '65%',
                          background: cert.color,
                          animation:  'coRingPulse 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                    <span
                      className="font-mono tracking-widest"
                      style={{ fontSize: 6.5, color: cert.color }}
                    >
                      65% COMPLETE
                    </span>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.image || undefined}
                      alt={cert.name}
                      className="h-full w-full object-cover opacity-75"
                      onError={e => {
                        const t  = e.target as HTMLImageElement
                        t.style.display = 'none'
                        const fb = t.parentElement?.querySelector('.co-fb') as HTMLElement
                        if (fb) fb.style.display = 'flex'
                      }}
                    />
                    <div
                      className="co-fb absolute inset-0 items-center justify-center"
                      style={{ display: cert.image ? 'none' : 'flex', background: `${cert.color}18` }}
                    >
                      <span
                        className="font-orbitron font-black"
                        style={{ fontSize: 18, color: cert.color }}
                      >
                        {cert.name}
                      </span>
                    </div>
                  </>
                )}
                {/* Fade-to-dark at bottom */}
                <div
                  className="absolute bottom-0 inset-x-0 h-5 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(2,8,24,0.85), transparent)' }}
                />
              </div>

              {/* Text info */}
              <div className="p-2.5">
                <div
                  className="font-mono uppercase tracking-[2px] mb-0.5"
                  style={{ fontSize: 7, color: cert.color }}
                >
                  {cert.issuer}
                </div>
                <div
                  className="font-orbitron font-bold text-[#e2eaff] leading-tight mb-1"
                  style={{ fontSize: 9 }}
                >
                  {cert.name}
                </div>
                <div className="font-mono text-muted" style={{ fontSize: 7 }}>
                  {cert.date}
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <div
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: cert.status === 'earned' ? '#00f5d4' : cert.color }}
                  />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 6.5,
                      color: cert.status === 'earned' ? '#00f5d4' : cert.color,
                    }}
                  >
                    {cert.status === 'earned' ? 'VERIFIED' : 'IN PROGRESS'}
                  </span>
                </div>
              </div>

              {/* Corner HUD brackets */}
              <div
                className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r"
                style={{ borderColor: cert.color + '68' }}
              />
              <div
                className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l"
                style={{ borderColor: cert.color + '68' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Selected cert detail panel ── */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 z-[200]"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="mx-4 rounded-xl p-3"
              style={{
                background:     `linear-gradient(135deg, ${CERTS[selected].color}1c, rgba(2,8,24,0.97))`,
                border:         `1px solid ${CERTS[selected].color}45`,
                backdropFilter: 'blur(20px)',
                boxShadow:      `0 8px 40px ${CERTS[selected].color}22`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div
                    className="font-mono tracking-[2px] uppercase mb-0.5"
                    style={{ fontSize: 7.5, color: CERTS[selected].color }}
                  >
                    {CERTS[selected].issuer}
                    {CERTS[selected].certNum && (
                      <span className="ml-2 opacity-55">{CERTS[selected].certNum}</span>
                    )}
                  </div>
                  <div className="font-orbitron text-sm font-bold text-[#e2eaff] mb-1 leading-tight">
                    {CERTS[selected].fullName}
                  </div>
                  <p className="font-mono text-muted leading-relaxed line-clamp-2" style={{ fontSize: 9 }}>
                    {CERTS[selected].description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <a
                    href={CERTS[selected].verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono uppercase tracking-[1.5px] px-2.5 py-1 border transition-colors hover:opacity-80"
                    style={{
                      fontSize:    8,
                      borderColor: CERTS[selected].color + '55',
                      color:       CERTS[selected].color,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    Verify →
                  </a>
                  <button
                    className="font-mono text-muted hover:text-cyan transition-colors"
                    style={{ fontSize: 8 }}
                    onClick={e => { e.stopPropagation(); setSelected(null) }}
                  >
                    [ESC]
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hint text ── */}
      <AnimatePresence>
        {selected === null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-muted pointer-events-none whitespace-nowrap"
            style={{ fontSize: 8, letterSpacing: '2.5px' }}
          >
            DRAG TO ROTATE · CLICK CERT TO INSPECT
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes coRingPulse {
          0%, 100% { opacity: 0.30; }
          50%       { opacity: 0.80; }
        }
        @keyframes coSpinCW {
          from { transform: scale(1.15) rotate(0deg); }
          to   { transform: scale(1.15) rotate(360deg); }
        }
        @keyframes coSpinCCW {
          from { transform: scale(1.24) rotate(0deg); }
          to   { transform: scale(1.24) rotate(-360deg); }
        }
        @keyframes coScan {
          0%   { transform: translateY(-4px);   opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 0.7; }
          100% { transform: translateY(136px);  opacity: 0; }
        }
      `}</style>
    </div>
  )
}

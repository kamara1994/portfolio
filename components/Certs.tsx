'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeader from './ui/SectionHeader'

const certs = [
  {
    name: 'Security+',
    fullName: 'CompTIA Security+',
    issuer: 'CompTIA',
    date: 'Active Certification',
    status: 'earned',
    image: '/images/cert-securityplus.png',
    verifyUrl: 'https://www.certmetrics.com/comptia/public/verification.aspx',
    color: '#FF0000',
    description: 'Validates baseline cybersecurity skills including threat detection, risk management, network security, cryptography, and compliance fundamentals.',
  },
  {
    name: 'PenTest+',
    fullName: 'CompTIA PenTest+',
    issuer: 'CompTIA',
    date: 'Active Certification',
    status: 'earned',
    image: '/images/cert-pentest.png',
    verifyUrl: 'https://www.certmetrics.com/comptia/public/verification.aspx',
    color: '#FF6B00',
    description: 'Validates penetration testing skills including planning, scoping, vulnerability scanning, exploitation techniques, and professional reporting.',
  },
  {
    name: 'CCNA',
    fullName: 'Cisco Certified Network Associate',
    issuer: 'Cisco',
    date: 'Active Certification',
    status: 'earned',
    image: '/images/cert-ccna.png',
    verifyUrl: 'https://cp.certmetrics.com/cisco/en/public/verify',
    color: '#00BCEB',
    description: 'Validates skills in network fundamentals, IP connectivity, routing protocols, VLANs, security fundamentals, and network automation.',
  },
  {
    name: 'PSAA',
    fullName: 'Practical SOC Analyst Associate',
    issuer: 'TCM Security',
    date: 'March 26, 2026',
    certNum: '#178154778',
    status: 'earned',
    image: '/images/cert-psaa.png',
    verifyUrl: 'https://certifications.tcm-sec.com/verify',
    color: '#818CF8',
    description: 'Hands-on SOC analyst certification covering threat detection, alert triage, incident response, SIEM operations, and real-world security investigations.',
  },
  {
    name: 'AWS Security',
    fullName: 'AWS Certified Security – Specialty',
    issuer: 'Amazon Web Services',
    date: 'In Progress · 2026',
    status: 'progress',
    image: '/images/cert-aws.png',
    verifyUrl: 'https://aws.amazon.com/certification/certified-security-specialty/',
    color: '#FF9900',
    description: 'Advanced AWS security certification covering GuardDuty, Security Hub, IAM, KMS, CloudTrail, WAF, and incident response on AWS infrastructure.',
  },
]

function CertModal({ cert, onClose }: { cert: typeof certs[0], onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(2,8,24,0.92)] backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-card p-6 mb-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] tracking-[3px] uppercase mb-1" style={{ color: cert.color }}>
                {cert.issuer}
              </div>
              <div className="font-orbitron text-2xl font-black text-[#e2eaff]">{cert.fullName}</div>
              <div className="font-mono text-[11px] text-muted mt-1">{cert.date} {cert.certNum && `· ${cert.certNum}`}</div>
            </div>
            <button
              onClick={onClose}
              className="font-mono text-[11px] text-muted hover:text-cyan transition-colors border border-[rgba(0,212,255,0.2)] px-3 py-1.5 hover:border-cyan"
            >
              ESC
            </button>
          </div>
          <p className="text-[13px] text-muted leading-relaxed">{cert.description}</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="terminal-bar">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-400" />
            <div className="terminal-dot bg-green-400" />
            <span className="font-mono text-[10px] text-muted ml-2 tracking-wider">certificate.png</span>
          </div>
          <div className="relative bg-[#000d1a] min-h-[300px] flex items-center justify-center">
            {cert.status === 'progress' ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center animate-pulse"
                  style={{ borderColor: cert.color }}>
                  <span className="text-2xl">⟳</span>
                </div>
                <div className="font-orbitron text-xl font-bold" style={{ color: cert.color }}>IN PROGRESS</div>
                <div className="font-mono text-[11px] text-muted max-w-sm leading-relaxed">
                  Currently studying for AWS Security Specialty. Expected completion 2026.
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between font-mono text-[9px] text-muted mb-1">
                    <span>PROGRESS</span><span style={{ color: cert.color }}>65%</span>
                  </div>
                  <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '65%', background: cert.color }} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.image}
                  alt={cert.fullName}
                  className="w-full h-auto max-h-[400px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.nextSibling) (target.nextSibling as HTMLElement).style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center flex-col gap-3">
                  <div className="font-mono text-[11px] text-muted tracking-wider">Certificate image not found</div>
                  <div className="font-mono text-[10px] text-[rgba(0,212,255,0.4)]">Add {cert.image} to your project</div>
                </div>
              </>
            )}
          </div>
          <div className="p-4 flex justify-between items-center border-t border-[rgba(0,212,255,0.08)]">
            <span className="font-mono text-[10px] flex items-center gap-2"
              style={{ color: cert.status === 'earned' ? '#00f5d4' : cert.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cert.status === 'earned' ? '#00f5d4' : cert.color }} />
              {cert.status === 'earned' ? 'VERIFIED CREDENTIAL' : 'IN PROGRESS'}
            </span>
            <a
              href={cert.verifyUrl}
              target="_blank"
              className="font-mono text-[10px] tracking-[2px] uppercase px-4 py-2 border border-[rgba(0,212,255,0.3)] text-cyan hover:bg-[rgba(0,212,255,0.07)] transition-colors"
            >
              {cert.status === 'earned' ? 'Verify →' : 'Learn More →'}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Certs() {
  const [selected, setSelected] = useState<typeof certs[0] | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section id="certs" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="Credentials" title="Certifi" accent="cations" />

        <p className="font-mono text-[11px] text-muted tracking-[2px] mb-10 -mt-8">
          Click any certificate to view the full credential
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(cert)}
              onMouseEnter={() => setHovered(cert.name)}
              onMouseLeave={() => setHovered(null)}
              className="glass-card cursor-pointer relative overflow-hidden group"
              style={{
                border: hovered === cert.name
                  ? `1px solid ${cert.color}40`
                  : '1px solid rgba(0,212,255,0.12)',
                transition: 'all 0.3s',
                transform: hovered === cert.name ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)`,
                  opacity: hovered === cert.name ? 1 : 0.4,
                }}
              />

              <div className="relative h-36 bg-[#000d1a] overflow-hidden flex items-center justify-center">
                {cert.status === 'progress' ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-4 text-center"
                    style={{ background: `linear-gradient(135deg, ${cert.color}11, #020818)` }}>
                    <div className="font-orbitron text-2xl font-black" style={{ color: cert.color }}>AWS</div>
                    <div className="font-mono text-[8px] tracking-widest" style={{ color: cert.color }}>IN PROGRESS</div>
                    <div className="w-full h-0.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: '65%', background: cert.color }} />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.image}
                      alt={cert.fullName}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity scale-105 group-hover:scale-100 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.nextSibling) (target.nextSibling as HTMLElement).style.display = 'flex'
                      }}
                    />
                    <div
                      className="absolute inset-0 hidden items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${cert.color}22, #020818)` }}
                    >
                      <div className="text-center">
                        <div className="font-orbitron text-3xl font-black mb-1" style={{ color: cert.color }}>{cert.name}</div>
                        <div className="font-mono text-[9px] text-muted tracking-widest">ADD CERT IMAGE</div>
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050e24] via-transparent to-transparent" />
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                  style={{ opacity: hovered === cert.name ? 1 : 0 }}
                >
                  <div className="font-mono text-[10px] tracking-[3px] uppercase text-white bg-[rgba(0,0,0,0.6)] px-4 py-2 border border-[rgba(255,255,255,0.2)]">
                    View Cert
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="font-mono text-[9px] tracking-[2px] uppercase mb-1" style={{ color: cert.color }}>
                  {cert.issuer}
                </div>
                <div className="font-orbitron text-sm font-bold text-[#e2eaff] mb-1 leading-tight">
                  {cert.fullName}
                </div>
                <div className="font-mono text-[10px] text-muted mb-3">{cert.date}</div>
                {cert.certNum && (
                  <div className="font-mono text-[9px] text-muted mb-3">{cert.certNum}</div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 ${
                    cert.status === 'earned'
                      ? 'bg-[rgba(0,245,212,0.08)] border border-[rgba(0,245,212,0.25)] text-neon'
                      : 'bg-[rgba(255,153,0,0.08)] border border-[rgba(255,153,0,0.25)]'
                  }`} style={{ color: cert.status === 'earned' ? '#00f5d4' : cert.color }}>
                    {cert.status === 'earned' ? '✓ EARNED' : '⟳ IN PROGRESS'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <CertModal cert={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
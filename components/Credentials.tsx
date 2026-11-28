'use client'
import { useState } from 'react'
import { certs } from '@/data'
import { projects } from '@/data/projects'
import CredentialDetails from './CredentialDetails'

// Individual verification URLs must identify this holder, not just the certification program.
// The PenTest+ reference is listed on the holder's public LinkedIn profile.
// Until other individual URLs are supplied, distinguish issuer lookup from a request for proof.
const VERIFY: Record<string, { href: string; label: string; title: string }> = {
  'Practical SOC Analyst Associate (PSAA)': { href: 'https://certified.tcm-sec.com/bfad6249-bde8-4872-a49d-e7391482f93e', label: 'Verify', title: 'Open individual TCM Security credential on Accredible' },
  'Security+': { href: 'https://cp.certmetrics.com/CompTIA/en/public/verify/credential', label: 'Issuer lookup', title: 'Open CompTIA credential verification (individual verification code required)' },
  CCNA: { href: 'https://cp.certmetrics.com/cisco/en/public/verify/credential', label: 'Issuer lookup', title: 'Open Cisco credential verification (individual verification code required)' },
  'PenTest+': { href: 'https://cp.certmetrics.com/CompTIA/en/public/verify/credential/b849fdfc86d84609affadca6e6dbe640', label: 'Verify', title: 'Open the PenTest+ credential reference published on LinkedIn' },
}
const requestProof = (name: string) => 'mailto:kamarajosephallan@gmail.com?subject=' + encodeURIComponent('Credential verification: ' + name) + '&body=' + encodeURIComponent('Hello, could you share the public issuer verification link for ' + name + '? Thank you.')

// Badge art and the dates already shown in the journey
const META: Record<string, { img?: string; tile?: { top: string; main: string; bg: string }; when?: string; area: string }> = {
  'Security+': { img: '/certs/security-plus.webp', when: 'Mar 2025', area: 'Threats, risk, cryptography, network security' },
  CCNA: { img: '/certs/ccna.png', area: 'Routing, switching, VLANs, OSPF, SSH hardening' },
  'Practical SOC Analyst Associate (PSAA)': { img: '/certs/tcm-psaa.webp', when: 'Mar 2026', area: 'SOC operations, alert triage, incident response' },
  'PenTest+': { img: '/certs/pentest-plus.webp', when: 'Mar 2026', area: 'Penetration testing and vulnerability assessment' },
  'AWS Security Specialty': { tile: { top: 'AWS', main: 'SCS', bg: '#1B2433' }, area: 'Studying now: AWS security services and design' },
}


// Only reference project routes with published case studies.
const DETAIL: Record<string, { id: string; skills: string[]; projectIds: string[] }> = {
  'Security+': { id: 'credential-security-plus', skills: ['Threats and vulnerabilities','Risk management','Cryptography','Security architecture','Incident response'], projectIds: ['fortress-v2','blue-soc-p8','cyber375-endpoint'] },
  CCNA: { id: 'credential-ccna', skills: ['IP connectivity','Routing and switching','VLANs','Network access','Network security','Automation fundamentals'], projectIds: ['salone-aegis','enterprise-networking','wireless-vlan-ssid'] },
  'Practical SOC Analyst Associate (PSAA)': { id: 'credential-psaa', skills: ['Alert triage','Security monitoring','Log analysis','Incident investigation','Threat detection'], projectIds: ['cyber375-final-ir','cyber375-splunk','blue-soc-p8'] },
  'PenTest+': { id: 'credential-pentest-plus', skills: ['Reconnaissance','Vulnerability analysis','Penetration testing','Exploitation concepts','Reporting'], projectIds: ['cyber375-vuln-assess','cyber375-network-threat'] },
  'AWS Security Specialty': { id: 'credential-aws-security', skills: ['IAM','Cloud logging','Network security','Data protection'], projectIds: ['aws-iam-security','aws-vpc-peering','cloud-cafe-architecture'] },
}
const publicCredential = (c: typeof certs[number]) => c.credlyUrl || (c.name === 'Practical SOC Analyst Associate (PSAA)' ? VERIFY[c.name].href : undefined)

// Strongest first for SOC, security and cloud roles
const ORDER = ['Security+', 'Practical SOC Analyst Associate (PSAA)', 'CCNA', 'PenTest+', 'AWS Security Specialty']
const rank = (n: string) => { const i = ORDER.indexOf(n); return i === -1 ? 99 : i }
const PHONE_FIRST = 3

export default function Credentials() {
  const [all, setAll] = useState(false)
  const sorted = [...certs].sort((a, b) => rank(a.name) - rank(b.name))
  const hidden = [...sorted.slice(PHONE_FIRST).map(c => c.name.replace(/ \(.*\)$/, '')), 'B.S. Cybersecurity']
  return (
    <section id="credentials" className="lazy-section border-t border-line">
      {/* Preserve the original badge colors while making its dark ink legible on a dark card. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none" focusable="false">
        <defs>
          <filter id="ccna-light-ink" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 -1.5 -1.5 0 1" result="darkness" />
            <feComponentTransfer in="darkness" result="inkMask"><feFuncA type="table" tableValues="0 0 0.15 0.7 1" /></feComponentTransfer>
            <feComposite in="inkMask" in2="SourceAlpha" operator="in" result="visibleInk" />
            <feFlood floodColor="#e8f3ff" result="lightInk" />
            <feComposite in="lightInk" in2="visibleInk" operator="in" result="replacement" />
            <feComposite in="replacement" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>
      <div className="wrap py-16 md:py-24">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Creden<span className="title-accent">tials</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Earned certifications, each with a way to verify it. Tap a name for its skills and projects.
        </p>

        <ul className="cred-grid mt-8" data-all={all}>
          {sorted.map((c, i) => {
            const m = META[c.name] ?? { area: '' }
            const earned = c.status === 'earned'
            const d = DETAIL[c.name]
            const directUrl = publicCredential(c)
            const related = d ? d.projectIds.flatMap(id => { const p = projects.find(p => p.id === id && p.placement); return p ? [{ id: p.id, title: p.title }] : [] }) : []
            return (
              <li key={c.name} id={d?.id} className={`cred-card ${earned ? '' : 'is-progress'}${c.name === 'CCNA' ? ' cred-ccna' : ''}${i >= PHONE_FIRST ? ' cred-more' : ''}`}>
                <div className="cred-art" aria-hidden="true">
                  {m.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.img} alt="" width={240} height={240} loading="lazy" decoding="async" />
                  ) : m.tile ? (
                    <div className="cred-art-tile" style={{ background: m.tile.bg }}>
                      <span>{m.tile.top}</span>
                      <strong>{m.tile.main}</strong>
                    </div>
                  ) : null}
                </div>
                <div className="cred-heading">
                  <div className="cred-title text-[18px] font-semibold leading-snug text-snow">{d ? <CredentialDetails item={{ id: d.id, name: c.name, issuer: c.issuer, image: m.img, issued: c.date || m.when, earned, directUrl, lookupUrl: earned && !directUrl ? VERIFY[c.name]?.href : undefined, requestUrl: earned && !directUrl ? requestProof(c.name) : undefined, skills: d.skills, projects: related, stackable: c.stackable }} /> : c.name}</div>
                  <p className="mt-1 text-[14.5px] text-smoke">{c.issuer}{m.when ? ` · ${m.when}` : ''}{c.expires ? ` · Expires ${c.expires.replace('March', 'Mar')}` : ''}</p>
                </div>
                <p className="cred-description mt-4 text-[14.5px] leading-relaxed text-snow/75">{m.area}</p>
                <div className="cred-actions flex items-center justify-between gap-3">
                  {!earned && <span className="cred-status">⏳ In progress</span>}
                  {earned && (c.credlyUrl || VERIFY[c.name] ? (
                    <a href={c.credlyUrl || VERIFY[c.name].href} target="_blank" rel="noopener noreferrer" className="tap cred-verify ml-auto" title={c.credlyUrl ? 'Open individual issuer-backed credential on Credly' : VERIFY[c.name].title} aria-label={(c.credlyUrl ? 'Verify' : VERIFY[c.name].label) + ' — ' + c.name}>{c.credlyUrl ? 'Verify' : VERIFY[c.name].label} ↗</a>
                  ) : (
                    <a href={requestProof(c.name)} className="tap cred-verify ml-auto" aria-label={'Request individual verification link for ' + c.name}>Request proof ↗</a>
                  ))}
                </div>
              </li>
            )
          })}
          <li id="credential-degree" className="cred-card cred-degree cred-more">
            <div className="cred-art cred-campus" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cred-campus-logo" src="/certs/byui-logo.svg" alt="" width={177} height={105} loading="eager" decoding="async" />
            </div>
            <div className="cred-heading">
                <p className="text-[18px] font-semibold leading-snug text-snow">B.S. Cybersecurity</p>
                <p className="mt-1 text-[14.5px] text-smoke">Brigham Young University–Idaho · Dec 2026</p>
            </div>
            <p className="cred-description mt-4 text-[14.5px] leading-relaxed text-snow/75">Networking, operating systems, cryptography, and security fundamentals.</p>
            <div className="cred-actions"><span className="cred-status">📅 Final semester</span></div>
          </li>
        </ul>
        {!all && (
          <div className="cred-more-row">
            <button type="button" className="more-toggle" aria-expanded={false} onClick={() => setAll(true)}>
              <span>Show all credentials</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="more-caret"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p className="more-teaser">Also: {hidden.join(' · ')}</p>
          </div>
        )}
        <p className="cred-footer">
          <a href="https://www.credly.com/users/joseph-allan-kamara" target="_blank" rel="noopener noreferrer">View all on Credly ↗</a>
          <span aria-hidden="true">·</span>
          <a href={requestProof('professional certifications')}>Request verification codes ↗</a>
        </p>
      </div>
    </section>
  )
}

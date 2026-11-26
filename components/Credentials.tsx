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
  'Network Vulnerability Assessment Professional (CNVP)': { img: '/certs/cnvp.png', when: 'Mar 2026', area: 'Stackable credential · Security+ and PenTest+ · Vulnerability assessment and penetration testing' },
  'AWS Security Specialty': { tile: { top: 'AWS', main: 'SCS', bg: '#1B2433' }, area: 'Studying now: AWS security services and design' },
}


// Only reference project routes with published case studies.
const DETAIL: Record<string, { id: string; skills: string[]; projectIds: string[] }> = {
  'Security+': { id: 'credential-security-plus', skills: ['Threats and vulnerabilities','Risk management','Cryptography','Security architecture','Incident response'], projectIds: ['fortress-v2','blue-soc-p8','cyber375-endpoint'] },
  CCNA: { id: 'credential-ccna', skills: ['IP connectivity','Routing and switching','VLANs','Network access','Network security','Automation fundamentals'], projectIds: ['salone-aegis','enterprise-networking','wireless-vlan-ssid'] },
  'Practical SOC Analyst Associate (PSAA)': { id: 'credential-psaa', skills: ['Alert triage','Security monitoring','Log analysis','Incident investigation','Threat detection'], projectIds: ['cyber375-final-ir','cyber375-splunk','blue-soc-p8'] },
  'PenTest+': { id: 'credential-pentest-plus', skills: ['Reconnaissance','Vulnerability analysis','Penetration testing','Exploitation concepts','Reporting'], projectIds: ['cyber375-vuln-assess','cyber375-network-threat'] },
  'Network Vulnerability Assessment Professional (CNVP)': { id: 'credential-cnvp', skills: ['Network security','Vulnerability assessment','Reconnaissance','Risk management','Penetration testing'], projectIds: ['cyber375-vuln-assess','cyber375-network-threat'] },
  'AWS Security Specialty': { id: 'credential-aws-security', skills: ['IAM','Cloud logging','Network security','Data protection'], projectIds: ['aws-iam-security','aws-vpc-peering','cloud-cafe-architecture'] },
}
const publicCredential = (c: typeof certs[number]) => c.credlyUrl || (c.name === 'Practical SOC Analyst Associate (PSAA)' ? VERIFY[c.name].href : undefined)

export default function Credentials() {
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
      <div className="wrap py-16 md:py-32">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Creden<span className="title-accent">tials</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Four standalone industry certifications earned, one stackable credential, and one certification in progress. Select a certification title for its badge, skills, projects and sharing options.
        </p>

        <ul className="cred-grid mt-8">
          {certs.map((c) => {
            const m = META[c.name] ?? { area: '' }
            const earned = c.status === 'earned'
            const d = DETAIL[c.name]
            const directUrl = publicCredential(c)
            const related = d ? d.projectIds.flatMap(id => { const p = projects.find(p => p.id === id && p.placement); return p ? [{ id: p.id, title: p.title }] : [] }) : []
            return (
              <li key={c.name} id={d?.id} className={`cred-card ${earned ? '' : 'is-progress'}${c.name === 'CCNA' ? ' cred-ccna' : ''}`}>
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
                  <span className={`cred-status ${earned ? 'is-earned' : ''}`}>{directUrl && earned ? '✓ Verified link' : earned ? '✅ Earned' : '⏳ In progress'}</span>
                  {earned && (c.credlyUrl || VERIFY[c.name] ? (
                    <a href={c.credlyUrl || VERIFY[c.name].href} target="_blank" rel="noopener noreferrer" className="tap cred-verify" title={c.credlyUrl ? 'Open individual issuer-backed credential on Credly' : VERIFY[c.name].title} aria-label={(c.credlyUrl ? 'Verify' : VERIFY[c.name].label) + ' — ' + c.name}>{c.credlyUrl ? 'Verify' : VERIFY[c.name].label} ↗</a>
                  ) : (
                    <a href={requestProof(c.name)} className="tap cred-verify" aria-label={'Request individual verification link for ' + c.name}>Request proof ↗</a>
                  ))}
                </div>
              </li>
            )
          })}
          <li id="credential-degree" className="cred-card cred-degree">
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
        <details className="cred-explore">
          <summary>Certification journey <span aria-hidden="true">+</span></summary>
          <div className="cred-explore-body">
            <ol className="cred-timeline">
              <li><time dateTime="2025-03">Mar 2025</time><a href="#credential-security-plus">Security+</a></li>
              <li><time dateTime="2026-03">Mar 2026</time><div><a href="#credential-pentest-plus">PenTest+</a> · <a href="#credential-cnvp">CNVP</a> (stackable)</div></li>
              <li><time dateTime="2026-03-26">Mar 26, 2026</time><a href="#credential-psaa">Practical SOC Analyst Associate</a></li>
            </ol>
            <p className="cred-detail-note"><a href="#credential-ccna">CCNA</a> is earned; its issue date is not listed. <a href="#credential-aws-security">AWS Security Specialty</a> is in progress. <a href="#credential-degree">B.S. Cybersecurity</a> is expected December 2026.</p>
          </div>
        </details>
        <details className="cred-explore">
          <summary>How the CompTIA credentials connect <span aria-hidden="true">+</span></summary>
          <div className="cred-explore-body">
            <div className="cred-combination"><a href="#credential-security-plus">Security+</a><span aria-hidden="true">+</span><a href="#credential-pentest-plus">PenTest+</a><span aria-hidden="true">→</span><a href="#credential-cnvp">CNVP</a></div>
            <p className="cred-detail-note">CNVP is a stackable credential awarded from the qualifying Security+ and PenTest+ certifications; it does not require a separate exam.</p>
          </div>
        </details>
        <p className="mt-4 max-w-[62ch] text-[13px] leading-relaxed"><a href="https://www.credly.com/users/joseph-allan-kamara" target="_blank" rel="noopener noreferrer" className="text-[#9bdcff] underline underline-offset-2">View all credentials on Credly ↗</a></p>
        <p className="mt-3 max-w-[62ch] text-[12px] leading-relaxed text-smoke">Issuer lookup requires the individual verification code. <a href={requestProof("professional certifications")} className="text-[#9bdcff] underline underline-offset-2">Request verification links or codes</a> if needed.</p>
      </div>
    </section>
  )
}

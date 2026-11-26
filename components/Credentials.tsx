import { certs } from '@/data'

const VERIFY: Record<string, string> = {
  CompTIA: 'https://www.certmetrics.com/comptia/public/verification.aspx',
  Cisco: 'https://cp.certmetrics.com/cisco/en/public/verify',
  'TCM Security': 'https://certifications.tcm-sec.com/verify',
}

// Badge art and the dates already shown in the journey
const META: Record<string, { img?: string; tile?: { top: string; main: string; bg: string }; when?: string; area: string }> = {
  'Security+': { img: '/certs/security-plus.webp', when: 'Mar 2025', area: 'Threats, risk, cryptography, network security' },
  CCNA: { img: '/certs/ccna.png', area: 'Routing, switching, VLANs, OSPF, SSH hardening' },
  'Practical SOC Analyst Associate (PSAA)': { img: '/certs/tcm-psaa.webp', when: 'Mar 2026', area: 'SOC operations, alert triage, incident response' },
  'PenTest+': { img: '/certs/pentest-plus.webp', when: 'Mar 2026', area: 'Penetration testing and vulnerability assessment' },
  'AWS Security Specialty': { tile: { top: 'AWS', main: 'SCS', bg: '#1B2433' }, area: 'Studying now: AWS security services and design' },
}

export default function Credentials() {
  return (
    <section id="credentials" className="lazy-section border-t border-line">
      <div className="wrap py-16 md:py-32">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Creden<span className="title-accent">tials</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Four industry certifications earned, one in progress. Each earned one can be checked with the issuer.
        </p>

        <ul className="cred-grid mt-8">
          {certs.map((c) => {
            const m = META[c.name] ?? { area: '' }
            const earned = c.status === 'earned'
            return (
              <li key={c.name} className={`cred-card ${earned ? '' : 'is-progress'}${c.name === 'CCNA' ? ' cred-ccna' : ''}`}>
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
                  <p className="text-[18px] font-semibold leading-snug text-snow">{c.name}</p>
                  <p className="mt-1 text-[14.5px] text-smoke">{c.issuer}{m.when ? ` · ${m.when}` : ''}</p>
                </div>
                <p className="cred-description mt-4 text-[14.5px] leading-relaxed text-snow/75">{m.area}</p>
                <div className="cred-actions flex items-center justify-between gap-3">
                  <span className={`cred-status ${earned ? 'is-earned' : ''}`}>{earned ? '✅ Earned' : '⏳ In progress'}</span>
                  {earned && VERIFY[c.issuer] && (
                    <a href={VERIFY[c.issuer]} target="_blank" rel="noopener" className="tap cred-verify">Verify ↗</a>
                  )}
                </div>
              </li>
            )
          })}
          <li className="cred-card cred-degree">
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
      </div>
    </section>
  )
}

import { certs } from '@/data'

const VERIFY: Record<string, string> = {
  CompTIA: 'https://www.certmetrics.com/comptia/public/verification.aspx',
  Cisco: 'https://cp.certmetrics.com/cisco/en/public/verify',
  'TCM Security': 'https://certifications.tcm-sec.com/verify',
}

// Badge art and the dates already shown in the journey
const META: Record<string, { img?: string; tile?: { top: string; main: string; bg: string }; when?: string; area: string }> = {
  'Security+': { img: '/certs/security-plus.webp', when: 'Mar 2025', area: 'Threats, risk, cryptography, network security' },
  CCNA: { tile: { top: 'CISCO', main: 'CCNA', bg: '#0E2A4A' }, area: 'Routing, switching, VLANs, OSPF, SSH hardening' },
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

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => {
            const m = META[c.name] ?? { area: '' }
            const earned = c.status === 'earned'
            return (
              <li key={c.name} className={`cred-card ${earned ? '' : 'is-progress'}`}>
                <div className="flex items-start gap-4">
                  <div className="cred-badge">
                    {m.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.img} alt={`${c.name} badge`} width={240} height={240} loading="lazy" className="h-full w-full object-cover" />
                    ) : m.tile ? (
                      <div className="flex h-full w-full flex-col items-center justify-center leading-none" style={{ background: m.tile.bg }}>
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#9CC7F0]">{m.tile.top}</span>
                        <span className="mt-1 font-display text-[20px] font-bold text-white">{m.tile.main}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-semibold leading-snug text-snow">{c.name}</p>
                    <p className="mt-0.5 text-[14.5px] text-smoke">{c.issuer}{m.when ? ` · ${m.when}` : ''}</p>
                  </div>
                </div>
                <p className="mt-4 text-[14.5px] leading-relaxed text-snow/75">{m.area}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={`cred-status ${earned ? 'is-earned' : ''}`}>{earned ? '✅ Earned' : '⏳ In progress'}</span>
                  {earned && VERIFY[c.issuer] && (
                    <a href={VERIFY[c.issuer]} target="_blank" rel="noopener" className="tap cred-verify">Verify ↗</a>
                  )}
                </div>
              </li>
            )
          })}
          <li className="cred-card cred-degree">
            <div className="flex items-start gap-4">
              <div className="cred-badge flex items-center justify-center bg-[#10233D] text-[30px]"><span className="emoji">🎓</span></div>
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-semibold leading-snug text-snow">B.S. Cybersecurity</p>
                <p className="mt-0.5 text-[14.5px] text-smoke">Brigham Young University–Idaho · Dec 2026</p>
              </div>
            </div>
            <p className="mt-4 text-[14.5px] leading-relaxed text-snow/75">Networking, operating systems, cryptography, and security fundamentals.</p>
            <div className="mt-4"><span className="cred-status">📅 Final semester</span></div>
          </li>
        </ul>
      </div>
    </section>
  )
}

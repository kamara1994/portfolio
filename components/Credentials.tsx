import { certs } from '@/data'

const VERIFY: Record<string, string> = {
  CompTIA: 'https://www.certmetrics.com/comptia/public/verification.aspx',
  Cisco: 'https://cp.certmetrics.com/cisco/en/public/verify',
  'TCM Security': 'https://certifications.tcm-sec.com/verify',
}


export default function Credentials() {
  return (
    <section id="credentials" className="lazy-section border-t border-line">
      <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-16 md:py-32">
        <div className="md:col-span-12">
          <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Creden<span className="title-accent">tials</span></h2>
          <ul className="mt-12 grid border-t border-line md:grid-cols-2 md:gap-x-16 [&>li]:border-b [&>li]:border-line">
            {certs.map((c) => (
              <li key={c.name} className="flex items-baseline justify-between gap-6 py-5">
                <div>
                  <p className="text-[19px] font-semibold leading-snug">{c.name}</p>
                  <p className="mt-1 text-[15px] text-smoke">{c.issuer}</p>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-1 text-[14px]">
                  <span className={c.status === 'earned' ? 'text-snow/80' : 'text-smoke'}>
                    {c.status === 'earned' ? 'Earned' : 'In progress'}
                  </span>
                  {c.status === 'earned' && VERIFY[c.issuer] && (
                    <a href={VERIFY[c.issuer]} target="_blank" rel="noopener" className="tap text-[13px] text-[#6FD6FF] hover:text-white">
                      Verify with {c.issuer}
                    </a>
                  )}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-6 py-5">
              <div>
                <p className="text-[19px] font-semibold leading-snug">B.S. Cybersecurity</p>
                <p className="mt-1 text-[15px] text-smoke">Brigham Young University–Idaho</p>
              </div>
              <span className="shrink-0 text-[14px] text-smoke">Dec 2026</span>
            </li>
          </ul>
        </div>

      </div>
    </section>
  )
}

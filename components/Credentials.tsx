import { certs, skillGroups } from '@/data'

const TOOLKIT = ['Security Operations', 'Cloud Security', 'Network Security', 'AI & Automation', 'Scripting & Dev']

export default function Credentials() {
  const groups = skillGroups.filter((g) => TOOLKIT.includes(g.title))

  return (
    <section id="credentials" className="border-t border-line">
      <div className="wrap grid gap-16 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5">
          <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Credentials</h2>
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {certs.map((c) => (
              <li key={c.name} className="flex items-baseline justify-between gap-6 py-5">
                <div>
                  <p className="text-[19px] font-semibold leading-snug">{c.name}</p>
                  <p className="mt-1 text-[15px] text-smoke">{c.issuer}</p>
                </div>
                <span className={`shrink-0 text-[14px] ${c.status === 'earned' ? 'text-snow/80' : 'text-smoke'}`}>
                  {c.status === 'earned' ? 'Earned' : 'In progress'}
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

        <div className="md:col-span-6 md:col-start-7">
          <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Toolkit</h2>
          <dl className="mt-12 space-y-8">
            {groups.map((g) => (
              <div key={g.title}>
                <dt className="text-[17px] font-semibold">{g.title}</dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-smoke">{g.skills.slice(0, 8).join(', ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

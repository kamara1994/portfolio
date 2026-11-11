import { experiences } from '@/data'

// Small emoji and the skills each role actually used (taken from its own bullets)
const META: Record<string, { icon: string; tags: string[] }> = {
  'BYU-Idaho Online Learning': { icon: '👨‍🏫', tags: ['Security assessments', 'DevOps', 'IT management', 'Teaching'] },
  'BYU-Idaho IT Help Desk': { icon: '🖥️', tags: ['Windows 10', 'Endpoint support', 'Incident escalation', 'Documentation'] },
  'ELITECOM Engineers Sierra Leone': { icon: '🏗️', tags: ['Next.js', 'Tailwind CSS', 'Security controls', 'Secure deployment'] },
}

export default function Experience() {
  return (
    <section id="experience" className="lazy-section border-t border-line">
      <div className="wrap py-16 md:py-32">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Exper<span className="title-accent">ience</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Support, teaching, and building: the work that sits behind the projects.
        </p>

        <ol className="exp-list-wrap mt-10 md:mt-14">
          {experiences.map((e) => {
            const m = META[e.company] ?? { icon: '🤝', tags: ['Operations', 'Documentation', 'Coordination'] }
            return (
              <li key={e.company + e.role} className="exp-row">
                <p className="exp-date">
                  {e.current && <span aria-hidden className="status-dot !h-1.5 !w-1.5" />}
                  {e.dates === 'Current' ? 'Now' : e.dates}
                </p>
                <div className="min-w-0">
                  <h3 className="exp-title">
                    <span aria-hidden className="emoji mr-2 text-[17px]">{m.icon}</span>
                    {e.role} <span className="exp-at">· {e.company}</span>
                  </h3>
                  <ul className="exp-points mt-3 space-y-2 text-[15.5px] leading-relaxed text-snow/75">
                    {e.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills used">
                    {m.tags.map((t) => <li key={t} className="exp-tag">{t}</li>)}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

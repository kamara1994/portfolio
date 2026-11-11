import { experiences } from '@/data'

const ICON: Record<string, string> = {
  'BYU-Idaho Online Learning': '👨‍🏫',
  'BYU-Idaho IT Help Desk': '🖥️',
  'ELITECOM Engineers Sierra Leone': '🏗️',
}

export default function Experience() {
  return (
    <section id="experience" className="lazy-section border-t border-line">
      <div className="wrap py-16 md:py-32">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Exper<span className="title-accent">ience</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Support, teaching, and building: the work that sits behind the projects.
        </p>

        <ol className="mt-10 grid items-start gap-4 lg:grid-cols-2">
          {experiences.map((e) => (
            <li key={e.company + e.role} className={`exp-card ${e.current ? 'is-current' : ''}`}>
              <div className="flex items-start gap-4">
                <span className="exp-icon"><span className="emoji">{ICON[e.company] ?? '🤝'}</span></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[18px] font-semibold leading-snug text-snow">{e.role}</p>
                    {e.current && <span className="exp-now"><span className="status-dot !h-1.5 !w-1.5" /> Current</span>}
                  </div>
                  <p className="mt-0.5 text-[14.5px] text-smoke">{e.company}</p>
                  {e.dates !== 'Current' && <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.14em] text-[#7FA6FF]">{e.dates}</p>}
                </div>
              </div>
              <ul className="exp-list mt-5 space-y-2.5 text-[15px] leading-relaxed text-snow/80">
                {e.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

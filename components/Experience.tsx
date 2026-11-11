import { experiences } from '@/data'

export default function Experience() {
  return (
    <section id="experience" className="lazy-section border-t border-line">
      <div className="wrap py-24 md:py-32">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Exper<span className="title-accent">ience</span></h2>
        <ol className="mt-12 divide-y divide-line border-y border-line">
          {experiences.map((e) => (
            <li key={e.company + e.role} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-4">
                <p className="text-[19px] font-semibold leading-snug">{e.role}</p>
                <p className="mt-1 text-[15px] text-smoke">{e.company}</p>
              </div>
              <ul className="space-y-2 text-[16px] leading-relaxed text-snow/80 md:col-span-6">
                {e.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="text-[15px] text-smoke md:col-span-2 md:text-right">{e.dates}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

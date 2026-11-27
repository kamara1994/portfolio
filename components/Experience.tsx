'use client'
import { useState } from 'react'
import { experiences } from '@/data'
import RevealRows from './RevealRows'

// Small emoji and the skills each role actually used (taken from its own bullets)
const META: Record<string, { icon: string; tags: string[] }> = {
  'BYU-Idaho Online Learning': { icon: '👨‍🏫', tags: ['Security assessments', 'DevOps', 'IT management', 'Teaching'] },
  'BYU-Idaho IT Help Desk': { icon: '🖥️', tags: ['Windows 10', 'Endpoint support', 'Incident escalation', 'Documentation'] },
  'ELITECOM Engineers Sierra Leone': { icon: '🏗️', tags: ['Next.js', 'Tailwind CSS', 'Security controls', 'Secure deployment'] },
}

const PHONE_FIRST = 2

export default function Experience() {
  const [all, setAll] = useState(false)
  const rest = experiences.slice(PHONE_FIRST)
  return (
    <section id="experience" className="lazy-section border-t border-line">
      <div className="wrap pb-8 pt-16 md:pb-20 md:pt-24">
        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-bold uppercase leading-none">Exper<span className="title-accent">ience</span></h2>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-smoke">
          Support, teaching, and building: the work that sits behind the projects.
        </p>

        <RevealRows selector=".exp-row" />
        <ol className="exp-list-wrap mt-10 md:mt-14" data-all={all}>
          {experiences.map((e, i) => {
            const m = META[e.company] ?? { icon: '🤝', tags: ['Operations', 'Documentation', 'Coordination'] }
            return (
              <li key={e.company + e.role} className={`exp-row${i >= PHONE_FIRST ? ' phone-more' : ''}`}>
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
        {!all && rest.length > 0 && (
          <div className="phone-more-row">
            <button type="button" className="more-toggle" aria-expanded={false} onClick={() => setAll(true)}>
              <span>Show all experience</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="more-caret"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p className="more-teaser">Also: {rest.map((e) => e.role).join(' · ')}</p>
          </div>
        )}
      </div>
    </section>
  )
}

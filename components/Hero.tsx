'use client'
import { RESUME } from './Nav'
import { ROLES, RoleTabs, useRole } from './role'

export default function Hero() {
  const { role } = useRole()
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden pb-20 pt-[104px] md:pb-28">
      {/* A single horizon of light: the only decoration on the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            'radial-gradient(120% 60% at 70% 100%, rgba(80,120,210,0.22) 0%, rgba(20,34,70,0.18) 40%, transparent 72%)',
        }}
      />
      <div className="wrap relative">
        <RoleTabs />
      </div>
      <div className="flex-1" />
      <div className="wrap relative mt-16">
        <h1 className="hero-rise font-display text-[clamp(56px,11.5vw,184px)] font-bold uppercase leading-[0.86] tracking-[-0.01em]">
          Joseph Allan
          <br />
          Kamara
        </h1>

        <div className="hero-rise-late mt-10 grid gap-10 md:grid-cols-12 md:items-end">
          <p className="max-w-[34ch] text-[clamp(20px,2vw,26px)] leading-snug text-snow/90 md:col-span-6">
            {ROLES[role].intro}
          </p>
          <div className="md:col-span-6 md:justify-self-end md:text-right">
            <p className="text-[15px] leading-relaxed text-smoke">
              Security+, PenTest+, CCNA, TCM PSAA
              <br />
              B.S. Cybersecurity, BYU-Idaho, December 2026
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <a href="#work" className="btn-primary">See my work</a>
              <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost">Download résumé</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

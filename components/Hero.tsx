import { RESUME } from './Nav'

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-28 pt-32 md:pb-32">
      {/* A single horizon of light behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%]"
        style={{
          background:
            'radial-gradient(110% 60% at 75% 100%, rgba(80,120,210,0.22) 0%, rgba(20,34,70,0.16) 42%, transparent 72%)',
        }}
      />
      <div className="wrap relative">
        <div className="hero-rise">
          <p className="flex items-center gap-3 text-[15px] text-snow/75">
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-signal/60 motion-safe:animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-signal" />
            </span>
            Open to full-time roles
          </p>

          <h1 className="mt-6 font-display text-[clamp(44px,6.6vw,116px)] font-bold uppercase leading-[0.92] tracking-[0.005em] ">
            Joseph Allan
            <br />
            Kamara
          </h1>
          <p className="mt-4 text-[clamp(20px,1.7vw,26px)] font-medium text-smoke">Cybersecurity Engineer</p>
        </div>

        <div className="hero-rise-late mt-12 grid gap-10 border-t border-line pt-10 md:mt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p className="max-w-[38ch] text-[clamp(18px,1.45vw,22px)] leading-relaxed text-snow/90 lg:col-span-4">
            I build SOC automation, cloud security labs on AWS, and AI tools that catch threats faster.
          </p>

          <dl className="grid grid-cols-2 gap-6 text-[15px] lg:col-span-4 lg:col-start-5 lg:grid-cols-1 lg:gap-4">
            <div className="lg:flex lg:items-baseline lg:gap-4">
              <dt className="text-smoke lg:w-20 lg:shrink-0">Certified</dt>
              <dd className="mt-1 leading-relaxed text-snow/90 lg:mt-0">Security+, PenTest+, CCNA, TCM PSAA</dd>
            </div>
            <div className="lg:flex lg:items-baseline lg:gap-4">
              <dt className="text-smoke lg:w-20 lg:shrink-0">Education</dt>
              <dd className="mt-1 leading-relaxed text-snow/90 lg:mt-0">B.S. Cybersecurity, BYU-Idaho, Dec 2026</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <a href="#work" className="btn-primary">See my work</a>
            <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost">Download résumé</a>
          </div>
        </div>
      </div>
    </section>
  )
}

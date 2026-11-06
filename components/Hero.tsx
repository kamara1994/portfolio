import { RESUME } from './Nav'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-14 pt-24 md:pb-16 md:pt-28">
      {/* A single horizon of light behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[80%]"
        style={{
          background:
            'radial-gradient(90% 60% at 78% 70%, rgba(80,120,210,0.22) 0%, rgba(20,34,70,0.16) 42%, transparent 72%)',
        }}
      />
      <div className="wrap relative">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Portrait: first on phones, right column on laptops */}
          <figure className="hero-rise relative w-[56%] max-w-[280px] sm:w-[44%] lg:order-2 lg:col-span-4 lg:col-start-9 lg:w-full lg:max-w-[340px] lg:justify-self-end lg:-mb-6">
            <div className="portrait relative aspect-[5/7] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile/joseph.jpg"
                alt="Portrait of Joseph Allan Kamara"
                width={360}
                height={504}
                fetchPriority="high"
                className="h-full w-full object-cover grayscale contrast-[1.08]"
              />
              <span aria-hidden className="absolute inset-0 mix-blend-color" style={{ background: 'linear-gradient(180deg, rgba(127,166,255,0.55), rgba(40,70,140,0.6))' }} />
              <span aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(80% 60% at 70% 20%, rgba(169,194,255,0.18), transparent 60%)' }} />
            </div>
          </figure>

          <div className="hero-rise lg:order-1 lg:col-span-8 lg:pb-6">
            <p className="flex items-center gap-3 text-[15px] text-snow/75">
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-signal/60 motion-safe:animate-ping" />
                <span className="relative h-2 w-2 rounded-full bg-signal" />
              </span>
              Open to full-time roles
            </p>
            <h1 className="mt-6">
              <span className="block text-[clamp(20px,1.7vw,26px)] font-medium text-snow/80">Hi, my name is</span>
              <span className="mt-3 block font-display text-[clamp(40px,5vw,88px)] font-bold uppercase leading-[0.92] tracking-[0.005em]">
              Joseph Allan
              <br />
              Kamara
              </span>
            </h1>
            <p className="mt-5 text-[clamp(19px,1.6vw,24px)] font-medium text-snow/80">
              Cybersecurity, Cloud Security, IT Infrastructure
            </p>
          </div>
        </div>

        <div className="hero-rise-late mt-10 grid gap-10 border-t border-line pt-9 md:mt-10 lg:grid-cols-12 lg:items-end lg:gap-8">
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

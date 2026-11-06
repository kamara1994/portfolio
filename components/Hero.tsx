import { RESUME } from './Nav'

const CERTS = [
  { name: 'Security+', img: '/certs/security-plus.png' },
  { name: 'PenTest+', img: '/certs/pentest-plus.png' },
  { name: 'CCNA', img: '' },
  { name: 'PSAA', img: '/certs/tcm-psaa.png' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line pb-14 pt-24 md:pb-16 md:pt-28">
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
          <figure className="hero-rise relative w-[56%] max-w-[280px] sm:w-[44%] lg:order-2 lg:col-span-4 lg:col-start-9 lg:w-full lg:max-w-[340px] lg:justify-self-end ">
            <div className="portrait relative aspect-[5/7] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile/joseph-portrait.jpg"
                alt="Portrait of Joseph Allan Kamara"
                width={900}
                height={1261}
                fetchPriority="high"
                className="h-full w-full object-cover object-top saturate-[0.92]"
              />
              <span aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(70% 62% at 52% 38%, transparent 50%, rgba(5,8,15,0.55) 80%, rgba(5,8,15,0.85) 100%)' }} />
            </div>
            <figcaption className="relative mt-5 lg:mt-3">
              <ul className="flex gap-3 lg:justify-center" aria-label="Certifications">
                {CERTS.map((c, i) => (
                  <li key={c.name} className="cert-in w-[72px] text-center" style={{ animationDelay: `${0.9 + i}s` }}>
                    <div className="cert-box">
                      {c.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.img} alt={`${c.name} badge`} width={240} height={240} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#0E2A4A] leading-none">
                          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#9CC7F0]">CISCO</span>
                          <span className="mt-1 font-display text-[19px] font-bold text-white">{c.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-[12px] font-medium text-snow/80">{c.name}</p>
                  </li>
                ))}
              </ul>
            </figcaption>
          </figure>

          <div className="hero-rise lg:order-1 lg:col-span-8 lg:pb-6">
            <h1>
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

        <div className="hero-rise-late mt-10 grid gap-10 md:mt-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p className="max-w-[38ch] text-[clamp(18px,1.45vw,22px)] leading-relaxed text-snow/90 lg:col-span-5">
            I build SOC automation, cloud security labs on AWS, and AI tools that catch threats faster.
          </p>

          <dl className="text-[15px] lg:col-span-3">
            <div>
              <dt className="text-smoke">Education</dt>
              <dd className="mt-1 leading-relaxed text-snow/90">B.S. Cybersecurity, BYU-Idaho, Dec 2026</dd>
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

import { RESUME } from './Nav'
import SeeMyWork from './SeeMyWork'

const CERTS = [
  { name: 'Security+', img: '/certs/security-plus.png' },
  { name: 'PenTest+', img: '/certs/pentest-plus.png' },
  { name: 'CCNA', img: '' },
  { name: 'PSAA', img: '/certs/tcm-psaa.png' },
]

export default function Hero() {
  return (
    <section className="hero-grid relative overflow-hidden border-b border-line pb-12 pt-20 md:pb-16 md:pt-24">
      <div className="wrap relative">
        {/* Name | portrait | focus */}
        <div className="grid items-center gap-7 lg:grid-cols-12 lg:gap-6">
          <figure className="hero-rise relative mx-auto w-[56%] max-w-[230px] sm:w-[70%] sm:max-w-[340px] lg:order-2 lg:col-span-4 lg:col-start-5 lg:w-full lg:max-w-[440px]">
            <span aria-hidden className="portrait-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile/joseph-cutout.webp"
              alt="Portrait of Joseph Allan Kamara"
              width={806}
              height={1143}
              fetchPriority="high"
              className="cutout relative w-full"
            />
            <ul className="relative -mt-4 flex justify-center gap-2 sm:gap-3" aria-label="Certifications">
              {CERTS.map((c, i) => (
                <li key={c.name} className="cert-in w-[60px] text-center sm:w-[72px]" style={{ animationDelay: `${0.9 + i}s` }}>
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
          </figure>

          <div className="hero-rise lg:order-1 lg:col-span-4 lg:col-start-1 lg:self-center">
            <h1>
              <span className="block text-[clamp(20px,1.6vw,26px)] font-medium text-snow/70">Hi, my name is</span>
              <span className="mt-3 block font-display text-[clamp(44px,4.4vw,80px)] font-bold uppercase leading-[0.92] tracking-[0.005em]">
                Joseph Allan
                <br />
                Kamara
              </span>
            </h1>
            <p className="mt-5 text-[clamp(20px,1.7vw,27px)] font-semibold leading-snug text-signal">
              Securing systems.
              <br className="sm:hidden" /> Automating defense.
            </p>
            <p className="mt-4 max-w-[40ch] text-[clamp(17px,1.3vw,20px)] leading-relaxed text-snow/85">
              I build SOC automation, AWS cloud security labs, and AI tools that catch threats faster.
            </p>
            <p className="mt-3 text-[15px] text-smoke">B.S. Cybersecurity, BYU-Idaho, graduating December 2026</p>
            <p className="now-line mt-4">
              <span className="now-tag">Now</span>
              Final semester, and preparing for the AWS Security Specialty exam.
            </p>
          </div>

          <div className="hero-rise lg:order-3 lg:col-span-4 lg:col-start-9 lg:self-center lg:justify-self-end">
            <p className="text-[clamp(20px,1.6vw,26px)] font-medium text-signal">Focused on</p>
            <p className="mt-3 font-display text-[clamp(30px,2.6vw,46px)] font-bold uppercase leading-[1.02] text-snow">
              Cybersecurity
              <br />
              Cloud Security
              <br />
              IT Infrastructure
            </p>
            <div className="btn-row mt-8 flex flex-wrap gap-3 lg:flex-nowrap">
              <SeeMyWork />
              <a href={RESUME} target="_blank" rel="noopener" className="btn-ghost">Download résumé</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

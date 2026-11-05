import { RESUME } from './Nav'

export const EMAIL = 'kamarajosephallan@gmail.com'
export const LINKEDIN = 'https://linkedin.com/in/joseph-allan-kamara'
export const GITHUB = 'https://github.com/kamara1994'

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{ background: 'radial-gradient(90% 70% at 20% 0%, rgba(80,120,210,0.14) 0%, transparent 65%)' }}
      />
      <div className="wrap relative grid gap-14 py-28 md:grid-cols-12 md:py-40">
        <div className="md:col-span-8">
          <h2 className="font-display text-[clamp(48px,7vw,112px)] font-bold uppercase leading-[0.9]">
            Hiring for security, cloud, or IT?
          </h2>
          <p className="mt-8 max-w-[44ch] text-[19px] leading-relaxed text-snow/85">
            I graduate in December 2026 and I&apos;m available now for full-time roles. Based in Philadelphia.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`mailto:${EMAIL}`} className="btn-primary">Email me</a>
            <a href={LINKEDIN} target="_blank" rel="noopener" className="btn-ghost">LinkedIn</a>
            <a href={GITHUB} target="_blank" rel="noopener" className="btn-ghost">GitHub</a>
          </div>
          <p className="mt-6 text-[15px] text-smoke">{EMAIL}</p>
        </div>
        <div className="md:col-span-3 md:col-start-10 md:self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/profile/joseph.jpg"
            alt="Joseph Allan Kamara"
            width={360}
            height={504}
            loading="lazy"
            className="w-40 border border-line grayscale md:w-full"
          />
          <a href={RESUME} target="_blank" rel="noopener" className="mt-4 inline-block text-[15px] text-snow/80 underline underline-offset-4 hover:text-snow">
            Download résumé (PDF)
          </a>
        </div>
      </div>
    </section>
  )
}

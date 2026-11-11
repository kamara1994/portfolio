import Link from 'next/link'
import MissingPath from '@/components/MissingPath'

export default function NotFound() {
  return (
    <main className="wrap flex min-h-[100svh] flex-col justify-center py-24">
      <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#FFB547]">
        <span aria-hidden className="h-2 w-2 rounded-full bg-[#FFB547] shadow-[0_0_10px_#FFB547]" /> Alert 404
      </p>
      <h1 className="mt-4 font-display text-[clamp(52px,10vw,150px)] font-bold uppercase leading-[0.88]">
        Page not <span className="title-accent">found</span>
      </h1>
      <p className="mt-6 max-w-[42ch] text-[18px] leading-relaxed text-snow/80">
        This address doesn&apos;t exist or has moved. No threat detected, just a wrong turn.
      </p>

      <div className="mt-8 max-w-[560px] rounded-2xl border border-line bg-panel/70 p-5 font-mono text-[13px] leading-relaxed text-smoke">
        <p><span className="text-[#FFB547]">event</span>  request.not_found</p>
        <p><span className="text-[#FFB547]">path </span>  <MissingPath /></p>
        <p><span className="text-[#FFB547]">action</span> route visitor to a known page</p>
      </div>

      <div className="btn-row mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/#work" className="btn-ghost">See my work</Link>
      </div>
    </main>
  )
}

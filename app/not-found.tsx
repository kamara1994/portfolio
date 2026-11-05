import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="wrap flex min-h-[100svh] flex-col justify-center">
      <h1 className="font-display text-[clamp(56px,10vw,160px)] font-bold uppercase leading-[0.88]">Page not found</h1>
      <p className="mt-6 max-w-[40ch] text-[19px] text-snow/80">This page doesn&apos;t exist or has moved.</p>
      <div className="mt-10"><Link href="/" className="btn-primary">Go to the homepage</Link></div>
    </main>
  )
}

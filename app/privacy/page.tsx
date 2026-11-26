import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy | Joseph Allan Kamara',
  description: 'What this portfolio collects about visits and the AI assistant, and why.',
}

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: 'Visit notifications',
    body: [
      'When you browse the site, it records which pages you open, roughly how long you spend and how far you scroll on each, which visitor type you pick (for example "Recruiter"), and clicks on the résumé, email, LinkedIn, GitHub, source-code, evidence and demo links. It also records the referring site, your screen size, browser and language.',
      'The server uses your IP address to look up an approximate city, region, network provider and, where available, the organisation that owns the network (through Vercel and ipinfo.io, over an encrypted connection). It never uses your device GPS.',
      'Automated traffic (search crawlers, link previews, data-centre networks) is filtered out. When a visit ends, an AI provider (Anthropic, Groq or Google Gemini) may write a short private summary of the visit from these details.',
      'I receive this as a private Telegram notification. It is not sold, shared, or used for advertising.',
    ],
  },
  {
    h: 'The AI assistant (PWEZA)',
    body: [
      'Questions you type or speak to the assistant are sent to an AI provider (Groq, Google Gemini, or Anthropic) to write the answer. Common questions are answered by the site itself without an AI provider.',
      'I also receive your questions and the start of each answer as a private notification, with your approximate city and country, so I can see what visitors want to know.',
      'If you turn on voice replies, the answer text is turned into speech by Microsoft’s text-to-speech service. Voice input uses your browser’s built-in speech recognition.',
      'Please do not share sensitive personal information in the chat.',
    ],
  },
  {
    h: 'What is stored in your browser',
    body: [
      'No cookies and no advertising trackers.',
      'The site keeps a random visitor ID and a visit count in your browser’s local storage so a return visit can be recognised, and the current visit’s progress and the previous page in session storage (cleared when you close the tab). Clearing this site’s data in your browser removes them.',
    ],
  },
  {
    h: 'Questions or removal',
    body: ['Email kamarajosephallan@gmail.com and I will answer or delete what I have about your visit.'],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="wrap pb-24 pt-36 md:pt-44">
        <div className="max-w-[760px]">
        <Link href="/" className="tap text-[15px] text-smoke hover:text-snow">Back to home</Link>
        <h1 className="mt-8 font-display text-[clamp(44px,6vw,80px)] font-bold uppercase leading-[0.9]">
          Priv<span className="title-accent">acy</span>
        </h1>
        <p className="mt-6 text-[18px] leading-relaxed text-snow/85">
          This is a personal portfolio. Here is exactly what it collects and why.
        </p>
        <div className="mt-14 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-[28px] font-bold uppercase leading-none">{s.h}</h2>
              <div className="mt-4 space-y-3 text-[17px] leading-[1.7] text-snow/80">
                {s.body.map((b) => <p key={b}>{b}</p>)}
              </div>
            </section>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

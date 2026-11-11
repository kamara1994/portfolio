import type { Metadata, Viewport } from 'next'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './globals.css'
import VisitTracker from '@/components/VisitTracker'
import LiveIcons from '@/components/LiveIcons'
import AIChat from '@/components/AIChat'
import MobileDock from '@/components/MobileDock'

const SITE = 'https://josephkamara.vercel.app'
const DESCRIPTION =
  'Cybersecurity engineer building SOC automation, AWS cloud security labs, and AI security tools. Security+, PenTest+, CCNA, PSAA. B.S. Cybersecurity, BYU-Idaho, December 2026.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Joseph Allan Kamara | Cybersecurity Engineer',
  description: DESCRIPTION,
  authors: [{ name: 'Joseph Allan Kamara', url: SITE }],
  openGraph: {
    type: 'website',
    url: SITE,
    title: 'Joseph Allan Kamara | Cybersecurity Engineer',
    description: DESCRIPTION,
    siteName: 'Joseph Allan Kamara',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Joseph Allan Kamara, cybersecurity. Securing systems. Automating defense.' }],
  },
  twitter: { card: 'summary_large_image', title: 'Joseph Allan Kamara | Cybersecurity Engineer', description: DESCRIPTION, images: ['/og.jpg'] },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

const PERSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joseph Allan Kamara',
  url: SITE,
  image: `${SITE}/profile/joseph-portrait.jpg`,
  jobTitle: 'Cybersecurity student and engineer',
  email: 'mailto:kamarajosephallan@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Philadelphia', addressRegion: 'PA', addressCountry: 'US' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Brigham Young University-Idaho' },
  knowsAbout: ['Security operations', 'SIEM', 'AWS cloud security', 'Terraform', 'Network security', 'Python', 'AI security'],
  hasCredential: ['CompTIA Security+', 'CompTIA PenTest+', 'Cisco CCNA', 'TCM Security Practical SOC Analyst Associate'].map((name) => ({
    '@type': 'EducationalOccupationalCredential', name,
  })),
  sameAs: ['https://github.com/kamara1994', 'https://linkedin.com/in/joseph-allan-kamara'],
}

export const viewport: Viewport = { themeColor: '#05080F' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink font-sans text-snow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }} />
        <VisitTracker />
        <LiveIcons />
        {children}
        <AIChat />
        <MobileDock />
      </body>
    </html>
  )
}

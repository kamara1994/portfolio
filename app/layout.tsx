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
    images: [{ url: '/profile/joseph-portrait.jpg', width: 900, height: 1261, alt: 'Joseph Allan Kamara' }],
  },
  twitter: { card: 'summary', title: 'Joseph Allan Kamara | Cybersecurity Engineer', description: DESCRIPTION },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: '#05080F' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink font-sans text-snow">
        <VisitTracker />
        <LiveIcons />
        {children}
        <AIChat />
      </body>
    </html>
  )
}

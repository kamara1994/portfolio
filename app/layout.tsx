import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'Joseph Allan Kamara | Cybersecurity Engineer',
  description: 'Cybersecurity Engineer specializing in SOC automation, AI-assisted threat detection, cloud security, and security operations. Builder of BLUE SOC, FORTRESS v2, and BLUE-X.',
  keywords: [
    'Cybersecurity Engineer', 'SOC Analyst', 'Security Engineer',
    'AI Security', 'Cloud Security', 'Splunk', 'AWS', 'Terraform',
    'BLUE SOC', 'Joseph Allan Kamara', 'Philadelphia', 'Security+', 'CCNA', 'PenTest+',
  ],
  authors: [{ name: 'Joseph Allan Kamara', url: 'https://josephkamara.vercel.app' }],
  creator: 'Joseph Allan Kamara',
  openGraph: {
    type: 'website',
    url: 'https://josephkamara.vercel.app',
    title: 'Joseph Allan Kamara | Cybersecurity Engineer',
    description: 'SOC automation, AI-assisted threat detection, cloud security, and incident response. Security+ · PenTest+ · CCNA · PSAA certified. Available May 2026.',
    siteName: 'Joseph Allan Kamara Portfolio',
    images: [{
      url: 'https://josephkamara.vercel.app/profile/joseph.jpg',
      width: 800, height: 800,
      alt: 'Joseph Allan Kamara — Cybersecurity Engineer',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Joseph Allan Kamara | Cybersecurity Engineer',
    description: 'SOC automation, AI-assisted threat detection, cloud security. Security+ · PenTest+ · CCNA · PSAA. Available May 2026.',
    images: ['https://josephkamara.vercel.app/profile/joseph.jpg'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://josephkamara.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#020818] text-[#e2eaff] antialiased">
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}

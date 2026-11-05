import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Work from '@/components/Work'
import Credentials from '@/components/Credentials'
import Experience from '@/components/Experience'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import AIChat from '@/components/AIChat'
import { RoleProvider } from '@/components/role'

export default function Home() {
  return (
    <RoleProvider>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Credentials />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <AIChat />
    </RoleProvider>
  )
}

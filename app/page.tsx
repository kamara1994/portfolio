import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Certs from '@/components/Certs'
import Experience from '@/components/Experience'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'

export default function Home() {
  return (
    <main className="relative">
      <GlowOrbs />
      <Nav />
      <Hero />
      <Projects />
      <Skills />
      <Certs />
      <Experience />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}

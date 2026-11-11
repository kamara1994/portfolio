import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Work from '@/components/Work'
import Credentials from '@/components/Credentials'
import Experience from '@/components/Experience'
import Story from '@/components/Story'
import Skills from '@/components/Skills'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Skills />
        <Credentials />
        <Experience />
        <Story />
      </main>
      <Footer />
    </>
  )
}

'use client'
// @ts-nocheck
import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import ProjectsFilter from '@/components/ProjectsFilter'
import Skills from '@/components/Skills'
import Certs from '@/components/Certs'
import Experience from '@/components/Experience'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import GlowOrbs from '@/components/ui/GlowOrbs'
import BootScreen from '@/components/BootScreen'
import ScrollProgress from '@/components/ScrollProgress'
import GitHubFeed from '@/components/GitHubFeed'
import JourneyTimeline from '@/components/JourneyTimeline'
import HireMe from '@/components/HireMe'
import ThreatTicker from '@/components/ThreatTicker'
import AIChat from '@/components/AIChat'
import RecruiterBriefing from '@/components/RecruiterBriefing'
import BlueSocSpotlight from '@/components/BlueSocSpotlight'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [booted, setBooted] = useState(false)

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />
      <AnimatePresence>
        {booted && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <GlowOrbs />
            <ScrollProgress />
            <Nav />

            <div className="pt-[72px]">
              <ThreatTicker />
            </div>

            {/* 1. Hero */}
            <Hero />

            {/* 2. Recruiter Briefing */}
            <RecruiterBriefing />

            {/* 3. BLUE SOC Flagship Spotlight */}
            <BlueSocSpotlight />

            {/* 4. GitHub Activity */}
            <section className="px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-4">Live Activity</div>
                <GitHubFeed />
              </div>
            </section>

            {/* 5. Projects + Currently Building */}
            <ProjectsFilter />

            <Skills />
            <Certs />
            <Experience />
            <JourneyTimeline />
            <About />
            <HireMe />
            <Contact />
            <AIChat />
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}

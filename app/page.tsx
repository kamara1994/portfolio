'use client'
// @ts-nocheck
import { useState, Suspense } from 'react'
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
import ScrollProgress from '@/components/ScrollProgress'
import GitHubFeed from '@/components/GitHubFeed'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import JourneyTimeline from '@/components/JourneyTimeline'
import HireMe from '@/components/HireMe'
import ThreatTicker from '@/components/ThreatTicker'
import AIChat from '@/components/AIChat'
import RecruiterBriefing from '@/components/RecruiterBriefing'
import BlueSocSpotlight from '@/components/BlueSocSpotlight'
import BlueSocDemo from '@/components/BlueSocDemo'
import RoleSwitcher from '@/components/RoleSwitcher'
import CommandPalette from '@/components/CommandPalette'
import SkillsQuiz from '@/components/SkillsQuiz'
import SafeSection from '@/components/ErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [booted, setBooted] = useState(true)

  return (
    <>
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
            <div className="pt-[72px]"><ThreatTicker /></div>
            <Suspense fallback={null}><RoleSwitcher /></Suspense>
            <SafeSection name="Hero"><Hero /></SafeSection>
            <SafeSection name="RecruiterBriefing"><RecruiterBriefing /></SafeSection>
            <SafeSection name="BlueSocSpotlight"><BlueSocSpotlight /></SafeSection>
            <SafeSection name="BlueSocDemo"><BlueSocDemo /></SafeSection>
            <section className="px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="font-mono text-[10px] text-neon tracking-[4px] uppercase mb-4">Live Activity</div>
                <SafeSection name="GitHubFeed"><GitHubFeed /></SafeSection>
              </div>
            </section>
            <SafeSection name="GitHubHeatmap"><GitHubHeatmap /></SafeSection>
            <SafeSection name="ProjectsFilter"><ProjectsFilter /></SafeSection>
            <SafeSection name="Skills"><Skills /></SafeSection>
            <SafeSection name="Certs"><Certs /></SafeSection>
            <SafeSection name="Experience"><Experience /></SafeSection>
            <SafeSection name="JourneyTimeline"><JourneyTimeline /></SafeSection>
            <SafeSection name="SkillsQuiz"><SkillsQuiz /></SafeSection>
            <SafeSection name="About"><About /></SafeSection>
            <SafeSection name="HireMe"><HireMe /></SafeSection>
            <SafeSection name="Contact"><Contact /></SafeSection>
            <AIChat />
            <CommandPalette />
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}

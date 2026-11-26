import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProjectLibrary from '@/components/ProjectLibrary'
import { projects } from '@/data/projects'
export const metadata: Metadata = { title: 'Engineering Project Library | Joseph Allan Kamara', description: 'Explore engineering projects by skill, evidence, technology and role.' }
export default function ProjectsPage() {
  return <><Nav/><ProjectLibrary projects={projects.filter(p => Boolean(p.placement))}/><Footer/></>
}

import dynamic from 'next/dynamic'
const ProjectNexus = dynamic(() => import('@/components/ProjectNexus'), { ssr: false })
export default function Page() { return <ProjectNexus /> }

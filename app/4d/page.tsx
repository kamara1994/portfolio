import dynamic from 'next/dynamic'
const Portfolio4D = dynamic(() => import('@/components/Portfolio4D'), { ssr: false })
export default function Page() { return <Portfolio4D /> }

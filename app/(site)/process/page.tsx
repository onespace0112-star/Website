import type { Metadata } from 'next'
import ProcessClient from '@/components/ProcessClient'

export const metadata: Metadata = {
    title: 'Process | ONE SPACE',
    description: 'One-stop delivery process: product inspection, logistics, customs clearance, delivery, and installation.',
}

export default function ProcessPage() {
    return <ProcessClient />
}

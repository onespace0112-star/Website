import type { Metadata } from 'next'
import KnowledgeClient from '@/components/KnowledgeClient'

export const metadata: Metadata = {
    title: 'Knowledge Base | ONE SPACE',
    description: 'Explore guides and insights on luxury furniture, building materials, and home furnishing from ONE SPACE experts.',
}

export default function KnowledgePage() {
    return <KnowledgeClient />
}

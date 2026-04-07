import type { Metadata } from 'next'
import KnowledgeClient from '@/components/KnowledgeClient'

export const metadata: Metadata = {
    title: '知识库 Knowledge Base | ONE SPACE',
    description: '高端家具选购指南、建材知识、软装搭配技巧。Guides and insights on luxury furniture, building materials from ONE SPACE experts.',
    keywords: ['家具知识', '建材指南', '软装搭配', '选购技巧', 'furniture guide', 'knowledge base', 'home furnishing tips'],
    alternates: { canonical: 'https://onespacecn.com/knowledge' },
}

export default function KnowledgePage() {
    return <KnowledgeClient />
}

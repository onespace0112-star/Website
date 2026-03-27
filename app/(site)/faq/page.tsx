import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import FAQClient from '@/components/FAQClient'
import '../home.css'

export const metadata: Metadata = {
    title: 'FAQ | ONE SPACE',
    description: 'Frequently asked questions about ONE SPACE furniture sourcing, customization, shipping, and installation services.',
}

export default async function FAQPage() {
    const faqs = await prisma.fAQ.findMany({
        where: { isActive: true },
        include: { type: true },
        orderBy: { order: 'asc' },
    })

    // Map backend Type names (from i18n) to frontend Category IDs
    const categoryMap: Record<string, string> = {
        'General | Company & Trust': 'general',
        '通用 | 公司与信任': 'general',
        'Products & Customization': 'products',
        '产品与定制': 'products',
        'Services & Process': 'services',
        '服务与流程': 'services',
        'Shipping & Installation': 'shipping',
        '物流与安装': 'shipping',
        'After-Sales Support': 'afterSales',
        '售后支持': 'afterSales'
    }

    // Serialize for client component
    const serializedFaqs = faqs.map((f: (typeof faqs)[number]) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        language: f.language,
        // Use mapped type name if available, otherwise fallback to existing category or type name
        category: (f.type?.name && categoryMap[f.type.name])
            ? categoryMap[f.type.name]
            : (f.category || f.type?.name || null),
    }))

    return <FAQClient faqs={serializedFaqs} />
}

import { Metadata } from 'next'
import { faqData } from '@/lib/faqData'

export const metadata: Metadata = {
    title: 'FAQ | ONE SPACE 常见问题',
    description: '关于 ONE SPACE 高端住宅一站式交付服务的常见问题解答：服务范围、质量控制、物流交付、费用说明等。',
    keywords: ['FAQ', '常见问题', '高端住宅', '家具采购', 'QC验货', '物流交付'],
    openGraph: {
        title: 'FAQ | ONE SPACE 常见问题',
        description: '关于 ONE SPACE 高端住宅一站式交付服务的常见问题解答',
        url: 'https://onespacecn.com/faq',
        siteName: 'ONE SPACE',
        type: 'website',
    },
}

// Generate JSON-LD for FAQ Schema
function generateFAQSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.map(faq => ({
            '@type': 'Question',
            name: faq.question_zh,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer_zh,
            },
        })),
    }
}

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const faqSchema = generateFAQSchema()

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {children}
        </>
    )
}

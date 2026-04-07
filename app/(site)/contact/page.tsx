import { Suspense } from 'react'
import ContactClient from '@/components/ContactClient'

export const metadata = {
    title: '联系我们 Contact Us | ONE SPACE',
    description: '联系 ONE SPACE 获取高端住宅交付方案报价，专业团队为您服务。Contact ONE SPACE for luxury home furnishing solutions and quotes.',
    keywords: ['联系我们', '报价咨询', '高端住宅', 'contact', 'ONE SPACE', 'furniture quote'],
    alternates: { canonical: 'https://onespacecn.com/contact' },
}

export default function ContactPage() {
    return (
        <Suspense fallback={null}>
            <ContactClient />
        </Suspense>
    )
}

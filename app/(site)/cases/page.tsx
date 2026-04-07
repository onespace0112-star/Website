import { Suspense } from 'react'
import { Metadata } from 'next'
import CasesClient from '@/components/CasesClient'
import '../home.css'

export const metadata: Metadata = {
    title: '项目案例 Luxury Project Cases | ONE SPACE',
    description: '高端别墅、公寓、酒店及商业空间交付案例。Explore our portfolio of luxury villas, apartments, hotels tailored with precision by ONE SPACE.',
    keywords: ['项目案例', '别墅交付', '酒店家具', '高端公寓', 'luxury villa', 'hotel furnishing', 'project cases'],
    alternates: { canonical: 'https://onespacecn.com/cases' },
}

export default function CasesPage() {
    return (
        <Suspense fallback={null}>
            <CasesClient />
        </Suspense>
    )
}

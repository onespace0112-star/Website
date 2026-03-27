import { Suspense } from 'react'
import { Metadata } from 'next'
import CasesClient from '@/components/CasesClient'
import '../home.css'

export const metadata: Metadata = {
    title: 'Luxury Project Cases | ONE SPACE',
    description: 'Explore our portfolio of luxury villas, apartments, hotels, and educational institutions tailored with precision.',
}

export default function CasesPage() {
    return (
        <Suspense fallback={null}>
            <CasesClient />
        </Suspense>
    )
}

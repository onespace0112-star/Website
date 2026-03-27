import { Suspense } from 'react'
import ContactClient from '@/components/ContactClient'

export const metadata = {
    title: 'Contact Us | ONE SPACE',
    description: 'Get in touch with ONE SPACE for professional furniture sourcing and luxury housing solutions.',
}

export default function ContactPage() {
    return (
        <Suspense fallback={null}>
            <ContactClient />
        </Suspense>
    )
}

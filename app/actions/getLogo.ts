'use server'

import prisma from '@/lib/prisma'

export async function getSiteLogo() {
    try {
        const logo = await prisma.siteLogo.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        return logo
    } catch (error) {
        console.error('Failed to fetch site logo:', error)
        return null
    }
}

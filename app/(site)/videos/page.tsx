import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import VideoClient from '@/components/VideoClient'
import '../home.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Videos | ONE SPACE',
    description: 'Watch ONE SPACE project showcases, factory tours, and furniture installation videos.',
}

export default async function VideosPage() {
    const header = await prisma.videoHeader.findFirst({
        where: {
            image: { not: null },
        },
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' },
        ],
    })

    const types = await prisma.videoType.findMany({
        orderBy: { order: 'asc' }
    })

    const videos = await prisma.videoItem.findMany({
        include: { type: true },
        orderBy: { order: 'asc' }
    })

    return <VideoClient header={header} types={types} videos={videos} />
}

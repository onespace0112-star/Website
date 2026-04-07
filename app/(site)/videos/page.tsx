import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import VideoClient from '@/components/VideoClient'
import '../home.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '视频中心 Videos | ONE SPACE',
    description: '观看 ONE SPACE 项目实拍、工厂参观、安装过程视频。Watch project showcases, factory tours, and installation videos by ONE SPACE.',
    keywords: ['项目视频', '工厂参观', '安装视频', 'project showcase', 'factory tour', 'installation video'],
    alternates: { canonical: 'https://onespacecn.com/videos' },
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

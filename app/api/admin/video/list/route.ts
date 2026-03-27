import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.videoItem.findMany({
            include: { type: true },
            orderBy: [
                { typeId: 'asc' },
                { order: 'asc' },
                { createdAt: 'asc' }
            ]
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const item = await prisma.videoItem.create({
            data: {
                typeId: body.typeId ? Number(body.typeId) : null,
                title: body.title || '未命名',
                videoUrl: body.videoUrl || null,
                coverImage: body.coverImage || null,
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增视频', `新增视频: ${item.title} (ID: ${item.id})`)
        } catch { }

        return NextResponse.json(item)
    } catch (error) {
        console.error('Create video error:', error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const items = await prisma.videoHeader.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch headers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const header = await prisma.videoHeader.create({
            data: {
                image: body.image || null,
                title: body.title || '未命名',
                height: Number(body.height || 600),
                description: body.description || null,
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增视频头部', `新增视频头部: ${header.title} (ID: ${header.id})`)
        } catch {}

        return NextResponse.json(header)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create header' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.videoType.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const type = await prisma.videoType.create({
            data: {
                name: body.name || '未命名',
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增视频类型', `新增视频类型: ${type.name} (ID: ${type.id})`)
        } catch {}

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create type' }, { status: 500 })
    }
}

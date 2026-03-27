import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const header = await prisma.videoHeader.update({
            where: { id },
            data: {
                image: body.image ?? null,
                title: body.title ?? '未命名',
                height: Number(body.height || 600),
                description: body.description ?? null,
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改视频头部', `修改视频头部: ${header.title} (ID: ${header.id})`)
        } catch {}

        return NextResponse.json(header)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update header' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        await prisma.videoHeader.delete({ where: { id } })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除视频头部', `删除视频头部: ID ${id}`)
        } catch {}
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete header' }, { status: 500 })
    }
}

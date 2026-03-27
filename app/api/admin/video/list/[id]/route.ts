import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const item = await prisma.videoItem.update({
            where: { id },
            data: {
                typeId: body.typeId ? Number(body.typeId) : null,
                title: body.title ?? '未命名',
                videoUrl: body.videoUrl ?? null,
                coverImage: body.coverImage ?? null,
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改视频', `修改视频: ${item.title} (ID: ${item.id})`)
        } catch { }

        return NextResponse.json(item)
    } catch (error) {
        console.error('Update video error:', error)
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        await prisma.videoItem.delete({ where: { id } })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除视频', `删除视频: ID ${id}`)
        } catch { }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete video error:', error)
        return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }
}

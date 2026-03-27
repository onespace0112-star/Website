import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const type = await prisma.videoType.update({
            where: { id },
            data: {
                name: body.name ?? '未命名',
                order: Number(body.order || 0)
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改视频类型', `修改视频类型: ${type.name} (ID: ${type.id})`)
        } catch { }

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update type' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        await prisma.videoType.delete({ where: { id } })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除视频类型', `删除视频类型: ID ${id}`)
        } catch { }
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete type' }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()

    try {
        const updatedItem = await prisma.homeGlobalCollect.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                icon: body.icon,
                order: body.order ? parseInt(String(body.order)) : undefined,
                updatedAt: new Date()
            }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改全球采集', `修改了: ${updatedItem.title}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(updatedItem)
    } catch (error: any) {
        console.error('Update GlobalCollect Error:', error)
        return NextResponse.json({
            error: 'Failed to update global collect item',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.homeGlobalCollect.delete({
            where: { id }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除全球采集', `删除了 ID: ${id}`)
        } catch (e) { console.error(e) }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete GlobalCollect Error:', error)
        return NextResponse.json({
            error: 'Failed to delete global collect item',
            details: error.message
        }, { status: 500 })
    }
}

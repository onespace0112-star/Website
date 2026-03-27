
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        const body = await req.json()

        // Handle bulk status update if array of IDs is not passed (this route is for single item update usually)
        // For general updates
        const { title, image, order, isVisible } = body

        const updated = await prisma.carousel.update({
            where: { id },
            data: {
                title,
                image,
                height: body.height ? parseInt(String(body.height)) : undefined,
                order: order !== undefined ? parseInt(String(order)) : undefined,
                isVisible
            }
        })

        await createLog('修改轮播图', `修改了轮播图: ${updated.title || 'No Title'} (ID: ${id})`)
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Update Carousel Error:', error)
        return NextResponse.json({
            error: 'Failed to update item',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        await prisma.carousel.delete({
            where: { id }
        })
        await createLog('删除轮播图', `删除了轮播图 ID: ${id}`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete Carousel Error:', error)
        return NextResponse.json({
            error: 'Failed to delete item',
            details: error.message
        }, { status: 500 })
    }
}

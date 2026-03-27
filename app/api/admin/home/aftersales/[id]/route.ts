
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()

    try {
        const updatedItem = await prisma.homeAfterSales.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(String(body.order)) : undefined,
                updatedAt: new Date()
            }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改售后服务', `修改了: ${updatedItem.title}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(updatedItem)
    } catch (error: any) {
        console.error('Update AfterSales Error:', error)
        return NextResponse.json({
            error: 'Failed to update item',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.homeAfterSales.delete({
            where: { id }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除售后服务', `删除了 ID: ${id}`)
        } catch (e) { console.error(e) }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete AfterSales Error:', error)
        return NextResponse.json({
            error: 'Failed to delete item',
            details: error.message
        }, { status: 500 })
    }
}

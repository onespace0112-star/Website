
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const id = parseInt(params.id)
    const body = await request.json()

    try {
        const updatedCase = await prisma.homeCase.update({
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
            await createLog('修改成功案例', `修改了案例: ${updatedCase.title}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(updatedCase)
    } catch (error: any) {
        console.error('Update HomeCase Error:', error)
        return NextResponse.json({
            error: 'Failed to update home case',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const id = parseInt(params.id)

    try {
        await prisma.homeCase.delete({
            where: { id }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除成功案例', `删除了案例 ID: ${id}`)
        } catch (e) { console.error(e) }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete HomeCase Error:', error)
        return NextResponse.json({
            error: 'Failed to delete home case',
            details: error.message
        }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr)
    const body = await request.json()

    try {
        const process = await prisma.process.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order !== undefined ? parseInt(body.order) : undefined,
                updatedAt: new Date()
            }
        })
        await createLog('修改流程', `修改了流程步骤: ${process.title} (ID: ${process.id})`)
        return NextResponse.json(process)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update process' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr)

    try {
        await prisma.process.delete({
            where: { id }
        })
        await createLog('删除流程', `删除了流程步骤 ID: ${id}`)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete process' }, { status: 500 })
    }
}

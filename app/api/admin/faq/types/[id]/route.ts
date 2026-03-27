
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr)
    const { name } = await request.json()

    try {
        const type = await prisma.fAQType.update({
            where: { id },
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('修改', `FAQ管理：修改分类 (ID: ${id}) - ${type.name}`)

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update FAQ type' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr)

    try {
        await prisma.fAQType.delete({
            where: { id }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('删除', `FAQ管理：删除分类 (ID: ${id})`)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete FAQ type' }, { status: 500 })
    }
}

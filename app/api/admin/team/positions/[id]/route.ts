
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params;
    const id = parseInt(params.id)
    const { name } = await request.json()

    try {
        const position = await prisma.teamPosition.update({
            where: { id },
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('修改', `团队管理：修改职位 (ID: ${id}) - ${position.name}`)

        return NextResponse.json(position)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params;
    const id = parseInt(params.id)

    try {
        await prisma.teamPosition.delete({
            where: { id }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('删除', `团队管理：删除职位 (ID: ${id})`)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}

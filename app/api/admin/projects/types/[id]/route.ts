
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const { name } = await request.json()

    try {
        const type = await prisma.projectType.update({
            where: { id },
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('修改', `项目案例管理：修改分类 (ID: ${id}) - ${type.name}`)

        return NextResponse.json(type)
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to update type',
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
        await prisma.projectType.delete({
            where: { id }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('删除', `项目案例管理：删除分类 (ID: ${id})`)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete type' }, { status: 500 })
    }
}

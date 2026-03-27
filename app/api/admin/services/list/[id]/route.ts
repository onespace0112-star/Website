
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
        const updatedItem = await prisma.serviceItem.update({
            where: { id },
            data: {
                typeId: body.typeId ? parseInt(String(body.typeId)) : undefined,
                image: body.image,
                icon: body.icon,
                description: body.description,
                order: body.order ? parseInt(String(body.order)) : undefined,
                updatedAt: new Date()
            }
        })

        // Log action
        await prisma.systemLog.create({
            data: {
                action: '修改',
                content: `服务列表管理：修改服务项 (ID: ${id}) - ${updatedItem.description || '无描述'}`,
            }
        })

        return NextResponse.json(updatedItem)
    } catch (error: any) {
        console.error('Update ServiceItem Error:', error)
        return NextResponse.json({
            error: 'Failed to update service item',
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
        await prisma.serviceItem.delete({
            where: { id }
        })

        // Log action
        await prisma.systemLog.create({
            data: {
                action: '删除',
                content: `服务列表管理：删除服务项 (ID: ${id})`,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete ServiceItem Error:', error)
        return NextResponse.json({
            error: 'Failed to delete service item',
            details: error.message
        }, { status: 500 })
    }
}

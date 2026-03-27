
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.serviceItem.findMany({
            include: { type: true },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch service items' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const newItem = await prisma.serviceItem.create({
            data: {
                typeId: parseInt(body.typeId),
                image: body.image,
                icon: body.icon,
                description: body.description,
                order: body.order ? parseInt(body.order) : 0,
            }
        })

        // Log action
        await prisma.systemLog.create({
            data: {
                action: '增加',
                content: `服务列表管理：新增服务项 - ${body.description || '无描述'}`,
            }
        })

        return NextResponse.json(newItem)
    } catch (error) {
        console.error('Service item create error:', error)
        return NextResponse.json({ error: 'Failed to create service item' }, { status: 500 })
    }
}

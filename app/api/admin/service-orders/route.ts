import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'design'

        const orders = await prisma.serviceOrder.findMany({
            where: { serviceCategory: category },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        }

        await prisma.serviceOrder.delete({ where: { id: Number(id) } })

        await prisma.systemLog.create({
            data: { action: '删除', content: `服务体系：删除订单 #${id}` }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }
}

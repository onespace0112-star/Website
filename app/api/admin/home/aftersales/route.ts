
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.homeAfterSales.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch after sales items' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const newItem = await prisma.homeAfterSales.create({
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(body.order) : 0,
            }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增售后服务', `新增了: ${newItem.title}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(newItem)
    } catch (error) {
        console.error('AfterSales create error:', error)
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
}

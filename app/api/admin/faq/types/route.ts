
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const types = await prisma.fAQType.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(types)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch FAQ types' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name } = await request.json()
        const type = await prisma.fAQType.create({
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('增加', `FAQ管理：新增分类 - ${type.name}`)

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create FAQ type' }, { status: 500 })
    }
}

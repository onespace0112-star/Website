
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const positions = await prisma.teamPosition.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(positions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name } = await request.json()
        const position = await prisma.teamPosition.create({
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('增加', `团队管理：新增职位 - ${position.name}`)

        return NextResponse.json(position)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}

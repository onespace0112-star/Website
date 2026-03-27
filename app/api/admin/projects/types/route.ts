
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const types = await prisma.projectType.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(types)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name } = await request.json()
        const type = await prisma.projectType.create({
            data: { name }
        })

        const { createLog } = await import('@/lib/logger')
        await createLog('增加', `项目案例管理：新增分类 - ${type.name}`)

        return NextResponse.json(type)
    } catch (error: any) {
        console.error('Create Type Error:', error)
        return NextResponse.json({
            error: 'Failed to create type',
            details: error.message
        }, { status: 500 })
    }
}

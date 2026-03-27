
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function GET() {
    try {
        const processes = await prisma.process.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(processes)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const process = await prisma.process.create({
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(body.order) : 0,
            }
        })
        await createLog('新增流程', `新增了流程步骤: ${process.title} (ID: ${process.id})`)
        return NextResponse.json(process)
    } catch (error) {
        console.error('Process create error:', error)
        return NextResponse.json({ error: 'Failed to create process' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(logs)
    } catch (error: any) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { action, content } = await request.json()
        await prisma.systemLog.create({
            data: {
                action,
                content
            }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { date, ids } = await request.json()

        // If "ids" provided (array of integers), delete specific logs (e.g., clearing selection)
        if (ids && Array.isArray(ids) && ids.length > 0) {
            await prisma.systemLog.deleteMany({
                where: { id: { in: ids } }
            })
            return NextResponse.json({ success: true })
        }

        // If "date" provided, delete all logs for that date
        if (date) {
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            await prisma.systemLog.deleteMany({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            })
            return NextResponse.json({ success: true })
        }

        // If no params, clear ALL logic is probably handled via ids anyway in frontend
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 })
    }
}

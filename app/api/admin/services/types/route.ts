
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const types = await prisma.serviceType.findMany({
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
        const type = await prisma.serviceType.create({
            data: { name }
        })
        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create type' }, { status: 500 })
    }
}

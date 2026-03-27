
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.qualityAssurance.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch QA items' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const newItem = await prisma.qualityAssurance.create({
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(body.order) : 0,
            }
        })
        return NextResponse.json(newItem)
    } catch (error) {
        console.error('QA create error:', error)
        return NextResponse.json({ error: 'Failed to create QA item' }, { status: 500 })
    }
}

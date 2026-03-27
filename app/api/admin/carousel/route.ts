
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const items = await prisma.carousel.findMany({
            orderBy: {
                order: 'asc'
            }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, image, order, isVisible } = body

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 })
        }

        const newItem = await prisma.carousel.create({
            data: {
                title,
                image,
                height: body.height ? parseInt(String(body.height)) : 800,
                order: order ? parseInt(String(order)) : 0,
                isVisible: isVisible ?? true
            }
        })
        await createLog('新增轮播图', `新增了轮播图: ${title} (ID: ${newItem.id})`)
        return NextResponse.json(newItem)
    } catch (error: any) {
        console.error('Create Carousel Error:', error)
        return NextResponse.json({
            error: 'Failed to create item',
            details: error.message
        }, { status: 500 })
    }
}

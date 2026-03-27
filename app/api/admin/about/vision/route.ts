import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const visions = await prisma.aboutVision.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(visions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch visions' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { image, description, descriptionZh } = body

        const vision = await prisma.aboutVision.create({
            data: {
                image,
                description,
                descriptionZh
            }
        })
        return NextResponse.json(vision)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create vision' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, image, description, descriptionZh } = body

        const vision = await prisma.aboutVision.update({
            where: { id },
            data: {
                image,
                description,
                descriptionZh
            }
        })
        return NextResponse.json(vision)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update vision' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
        await prisma.aboutVision.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete vision' }, { status: 500 })
    }
}

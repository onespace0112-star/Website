import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const intros = await prisma.aboutIntro.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(intros)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch intros' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { image, description, descriptionZh, order } = body

        const intro = await prisma.aboutIntro.create({
            data: {
                image,
                description,
                descriptionZh,
                order: order || 0
            }
        })
        return NextResponse.json(intro)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create intro' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, image, description, descriptionZh, order } = body

        const intro = await prisma.aboutIntro.update({
            where: { id },
            data: {
                image,
                description,
                descriptionZh,
                order: order || 0
            }
        })
        return NextResponse.json(intro)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update intro' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
        await prisma.aboutIntro.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete intro' }, { status: 500 })
    }
}

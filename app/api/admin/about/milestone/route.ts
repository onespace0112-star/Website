import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const milestones = await prisma.aboutMilestone.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(milestones)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { image, imageZh, description, descriptionZh } = body

        // Ensure description is a string
        const milestone = await prisma.aboutMilestone.create({
            data: {
                image,
                imageZh,
                description: description || '',
                descriptionZh
            }
        })
        return NextResponse.json(milestone)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, image, imageZh, description, descriptionZh } = body

        const milestone = await prisma.aboutMilestone.update({
            where: { id: Number(id) },
            data: {
                image,
                imageZh,
                description,
                descriptionZh
            }
        })
        return NextResponse.json(milestone)
    } catch (error) {
        console.error('PUT Error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
        await prisma.aboutMilestone.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const headers = await prisma.aboutHeader.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(headers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch headers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { image, title, titleZh, height, description, descriptionZh } = body

        console.log('Creating header with:', { image, title, titleZh, height, description, descriptionZh })

        if (!image) {
            throw new Error('Image is required')
        }

        const header = await prisma.aboutHeader.create({
            data: {
                image,
                title,
                titleZh,
                height: isNaN(Number(height)) ? 400 : Number(height),
                description,
                descriptionZh
            }
        })
        return NextResponse.json(header)
    } catch (error: any) {
        console.error('Create header error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create header' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, image, title, titleZh, height, description, descriptionZh } = body

        const header = await prisma.aboutHeader.update({
            where: { id },
            data: {
                image,
                title,
                titleZh,
                height: parseInt(height),
                description,
                descriptionZh
            }
        })
        return NextResponse.json(header)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update header' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
        await prisma.aboutHeader.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete header' }, { status: 500 })
    }
}

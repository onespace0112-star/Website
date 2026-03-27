
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const pid = parseInt(id)

        const item = await prisma.feedback.update({
            where: { id: pid },
            data: body
        })

        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update feedback' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.feedback.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete feedback' },
            { status: 500 }
        )
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Fix for Next.js 15 breaking changes for dynamic route params
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        // Check uniqueness if name changed
        const existing = await prisma.feedbackIssueType.findUnique({
            where: { name }
        })

        if (existing && existing.id !== parseInt(id)) {
            return NextResponse.json(
                { error: 'Issue type with this name already exists' },
                { status: 400 }
            )
        }

        const type = await prisma.feedbackIssueType.update({
            where: { id: parseInt(id) },
            data: { name }
        })

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update issue type' },
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
        const typeId = parseInt(id)

        await prisma.$transaction([
            prisma.feedback.updateMany({
                where: { typeId },
                data: { typeId: null }
            }),
            prisma.feedbackIssueType.delete({
                where: { id: typeId }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete issue type' },
            { status: 500 }
        )
    }
}

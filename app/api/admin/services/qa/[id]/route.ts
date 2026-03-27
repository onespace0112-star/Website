
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()

    try {
        const updatedItem = await prisma.qualityAssurance.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(String(body.order)) : undefined,
                updatedAt: new Date()
            }
        })
        return NextResponse.json(updatedItem)
    } catch (error: any) {
        console.error('Update QA Error:', error)
        return NextResponse.json({
            error: 'Failed to update QA item',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.qualityAssurance.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete QA Error:', error)
        return NextResponse.json({
            error: 'Failed to delete QA item',
            details: error.message
        }, { status: 500 })
    }
}


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

    // Destructure to remove id and createdAt from the update data
        const { id: _, createdAt, ...updateData } = body

    try {
        const quote = await prisma.quote.update({
            where: { id },
            data: updateData
        })
        return NextResponse.json(quote)
    } catch (error) {
        console.error('Failed to update quote:', error)
        return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.quote.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete quote:', error)
        return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'


export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params;
    try {
        const id = parseInt(params.id)
        const body = await request.json()

        // Destructure to remove id and createdAt from the update data
                const { id: _, createdAt, ...updateData } = body

        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json(inquiry)
    } catch (error) {
        console.error('Failed to update inquiry:', error)
        return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params;
    try {
        const id = parseInt(params.id)
        await prisma.inquiry.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete inquiry:', error)
        return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
    }
}

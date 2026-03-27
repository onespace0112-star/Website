import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const faq = await prisma.fAQ.findUnique({
        where: { id: parseInt(id) }
    })

    if (!faq) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(faq)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const { id } = await params
    const json = await request.json()

    const faq = await prisma.fAQ.update({
        where: { id: parseInt(id) },
        data: json
    })

    return NextResponse.json(faq)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const { id } = await params
    await prisma.fAQ.delete({
        where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
}

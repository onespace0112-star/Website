import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const project = await prisma.project.findUnique({
        where: { id: parseInt(id) }
    })

    if (!project) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(project)
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

    const project = await prisma.project.update({
        where: { id: parseInt(id) },
        data: json
    })

    return NextResponse.json(project)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const { id } = await params
    await prisma.project.delete({
        where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
}

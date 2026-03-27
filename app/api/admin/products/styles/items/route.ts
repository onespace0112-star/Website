import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

// GET /api/admin/products/styles/items?styleId=1
export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const styleId = Number(searchParams.get('styleId'))
    if (!styleId) return NextResponse.json({ error: '缺少 styleId' }, { status: 400 })

    const items = await prisma.productStyleItem.findMany({
        where: { styleId },
        orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(items)
}

// PATCH - update title of an item
export async function PATCH(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, title } = await request.json()
    const item = await prisma.productStyleItem.update({
        where: { id: Number(id) },
        data: { title: title || '' },
    })
    return NextResponse.json(item)
}

// DELETE - remove an item
export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await request.json()
    await prisma.productStyleItem.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
}

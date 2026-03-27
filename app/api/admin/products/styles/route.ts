import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
export const dynamic = 'force-dynamic'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const styles = await prisma.productStyle.findMany({ orderBy: { sortOrder: 'asc' } })
        return NextResponse.json(styles)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { name, nameZh, sortOrder, fileUrl, fileName } = await request.json()
        const item = await prisma.productStyle.create({
            data: { name: name || '', nameZh: nameZh || '', sortOrder: Number(sortOrder) || 0, fileUrl: fileUrl || '', fileName: fileName || '' },
        })
        await prisma.systemLog.create({
            data: { action: '新增', content: `产品管理：新增产品风格 [${name}]` },
        })
        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id, name, nameZh, sortOrder, fileUrl, fileName } = await request.json()
        const item = await prisma.productStyle.update({
            where: { id: Number(id) },
            data: { name: name || '', nameZh: nameZh || '', sortOrder: Number(sortOrder) || 0, fileUrl: fileUrl ?? undefined, fileName: fileName ?? undefined },
        })
        await prisma.systemLog.create({
            data: { action: '编辑', content: `产品管理：编辑产品风格 [${name}]` },
        })
        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await request.json()
        const item = await prisma.productStyle.delete({ where: { id: Number(id) } })
        await prisma.systemLog.create({
            data: { action: '删除', content: `产品管理：删除产品风格 [${item.name}]` },
        })
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/userAuth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

// GET - Get all knowledge base items
export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const items = await prisma.knowledgeBase.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
}

// POST - Create knowledge base item
export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, isActive = true, category, tags, priority } = body

    if (!title || !content) {
        return NextResponse.json({ error: '标题和内容是必填项' }, { status: 400 })
    }

    const item = await prisma.knowledgeBase.create({
        data: {
            title,
            content,
            isActive,
            category: category || null,
            tags: tags || null,
            priority: typeof priority === 'number' ? priority : 0,
        },
    })
    await createLog('新增知识库文章', `新增文章: ${title} (ID: ${item.id})`)

    return NextResponse.json({ item })
}

// PUT - Update knowledge base item
export async function PUT(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, content, isActive, category, tags, priority } = body

    if (!id) {
        return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    }

    const item = await prisma.knowledgeBase.update({
        where: { id },
        data: {
            title,
            content,
            isActive,
            category: category !== undefined ? (category || null) : undefined,
            tags: tags !== undefined ? (tags || null) : undefined,
            priority: typeof priority === 'number' ? priority : undefined,
        },
    })
    await createLog('修改知识库文章', `修改文章: ${title} (ID: ${item.id})`)

    return NextResponse.json({ item })
}

// DELETE - Delete knowledge base item
export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    }

    await prisma.knowledgeBase.delete({ where: { id: parseInt(id) } })
    await createLog('删除知识库文章', `删除文章 ID: ${id}`)

    return NextResponse.json({ success: true })
}

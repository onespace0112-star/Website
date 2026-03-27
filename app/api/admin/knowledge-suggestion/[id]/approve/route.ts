import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/userAuth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const suggestionId = parseInt(id)
    const body = await request.json()
    const { title, content, category, tags, priority } = body || {}

    const suggestion = await prisma.knowledgeSuggestion.findUnique({
        where: { id: suggestionId },
    })

    if (!suggestion) {
        return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    }

    const kbTitle = (title || suggestion.question).trim()
    const kbContent = (content || suggestion.suggestedAnswer || suggestion.question).trim()

    if (!kbTitle || !kbContent) {
        return NextResponse.json({ error: '标题或内容不能为空' }, { status: 400 })
    }

    const knowledge = await prisma.knowledgeBase.create({
        data: {
            title: kbTitle,
            content: kbContent,
            category: category || null,
            tags: tags || null,
            priority: typeof priority === 'number' ? priority : 0,
            isActive: true,
        }
    })

    await prisma.knowledgeSuggestion.update({
        where: { id: suggestionId },
        data: { status: 'approved' }
    })

    await createLog('知识补充审核通过', `补充内容入库: ${kbTitle} (ID: ${knowledge.id})`)

    return NextResponse.json({ success: true, knowledge })
}

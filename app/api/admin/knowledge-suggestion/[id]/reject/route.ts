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

    const suggestion = await prisma.knowledgeSuggestion.findUnique({
        where: { id: suggestionId },
    })

    if (!suggestion) {
        return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    }

    await prisma.knowledgeSuggestion.update({
        where: { id: suggestionId },
        data: { status: 'rejected' }
    })

    await createLog('知识补充审核拒绝', `拒绝补充: ${suggestion.question} (ID: ${suggestionId})`)

    return NextResponse.json({ success: true })
}

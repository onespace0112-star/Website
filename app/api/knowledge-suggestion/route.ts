import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { question, suggestedAnswer, contact } = body

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
        return NextResponse.json({ error: '问题描述过短' }, { status: 400 })
    }

    const suggestion = await prisma.knowledgeSuggestion.create({
        data: {
            userId: user.id,
            question: question.trim(),
            suggestedAnswer: suggestedAnswer?.trim() || null,
            contact: contact?.trim() || null,
        }
    })

    return NextResponse.json({ success: true, suggestion })
}

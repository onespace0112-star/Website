import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { chatWithAI } from '@/lib/ai'

const MAX_GUEST_MESSAGES = 5

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
        return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    const currentRaw = cookieStore.get('guest_chat_count')?.value || '0'
    const current = Number(currentRaw) || 0
    const nextCount = current + 1
    const remaining = Math.max(0, MAX_GUEST_MESSAGES - nextCount)

    if (current >= MAX_GUEST_MESSAGES) {
        return NextResponse.json({ error: '请登录后继续对话', remaining: 0 }, { status: 429 })
    }

    cookieStore.set('guest_chat_count', String(nextCount), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
    })

    const aiResponse = await chatWithAI(message, [])

    return NextResponse.json({
        message: {
            id: Date.now(),
            role: 'assistant',
            content: aiResponse.text,
            createdAt: new Date().toISOString(),
        },
        meta: {
            needsKnowledge: aiResponse.needsKnowledge,
            remaining,
        }
    })
}

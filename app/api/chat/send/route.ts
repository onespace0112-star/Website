import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'
import { chatWithAI } from '@/lib/ai'

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { chatId, message } = body

        if (!message) {
            return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
        }

        // If no chatId, create a new chat
        let chat
        if (!chatId) {
            chat = await prisma.chat.create({
                data: {
                    userId: user.id,
                    title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
                },
            })
        } else {
            chat = await prisma.chat.findFirst({
                where: { id: chatId, userId: user.id },
            })
            if (!chat) {
                return NextResponse.json({ error: '对话不存在' }, { status: 404 })
            }
        }

        // Save user message
        await prisma.chatMessage.create({
            data: {
                chatId: chat.id,
                role: 'user',
                content: message,
            },
        })

        // Get chat history for context
        const history = await prisma.chatMessage.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: 'asc' },
            take: 12, // Last messages for context
        })

        // Call AI
        const aiResponse = await chatWithAI(
            message,
            history
                .slice(0, -1)
                .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
        )

        // Save AI response
        const assistantMessage = await prisma.chatMessage.create({
            data: {
                chatId: chat.id,
                role: 'assistant',
                content: aiResponse.text,
            },
        })

        return NextResponse.json({
            chatId: chat.id,
            message: assistantMessage,
            meta: {
                needsKnowledge: aiResponse.needsKnowledge,
                sources: aiResponse.sources,
            }
        })
    } catch (error) {
        console.error('Chat send error:', error)
        return NextResponse.json(
            { error: '发送失败，请稍后重试' },
            { status: 500 }
        )
    }
}

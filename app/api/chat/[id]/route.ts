import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

// GET - Get chat with messages
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const chatId = parseInt(id)

    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: user.id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    })

    if (!chat) {
        return NextResponse.json({ error: '对话不存在' }, { status: 404 })
    }

    // Mark unread assistant messages as read
    await prisma.chatMessage.updateMany({
        where: {
            chatId: chat.id,
            role: 'assistant',
            isRead: false
        },
        data: {
            isRead: true
        }
    })

    return NextResponse.json({ chat })
}

// DELETE - Delete chat
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const chatId = parseInt(id)

    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: user.id },
    })

    if (!chat) {
        return NextResponse.json({ error: '对话不存在' }, { status: 404 })
    }

    await prisma.chat.delete({ where: { id: chatId } })

    return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

// GET - Get user's chats
export async function GET() {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    return NextResponse.json({ chats })
}

// POST - Create new chat
export async function POST() {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const chat = await prisma.chat.create({
        data: {
            userId: user.id,
            title: '新对话',
        },
    })

    return NextResponse.json({ chat })
}

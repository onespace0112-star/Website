
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

export async function GET() {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ count: 0 })
    }

    try {
        const count = await prisma.chatMessage.count({
            where: {
                chat: {
                    userId: user.id
                },
                role: 'assistant',
                isRead: false
            }
        })

        return NextResponse.json({ count })
    } catch (error) {
        console.error('Failed to fetch unread count:', error)
        return NextResponse.json({ count: 0 })
    }
}

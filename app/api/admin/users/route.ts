import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/userAuth'
import prisma from '@/lib/prisma'

// GET - Get all users
export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            createdAt: true,
            _count: {
                select: { chats: true },
            },
        },
    })

    return NextResponse.json({ users })
}

// DELETE - Delete user
export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: parseInt(id) } })

    try {
        const { createLog } = await import('@/lib/logger')
        await createLog('删除用户', `删除了用户 ID: ${id}`)
    } catch (e) {
        console.error('Log error', e)
    }

    return NextResponse.json({ success: true })
}

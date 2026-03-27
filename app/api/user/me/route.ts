import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/userAuth'
import prisma from '@/lib/prisma'

export async function GET() {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json(
            { error: '未登录' },
            { status: 401 }
        )
    }

    return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json(
            { error: '未登录' },
            { status: 401 }
        )
    }

    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''

    if (!name) {
        return NextResponse.json({ error: '名字不能为空' }, { status: 400 })
    }

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name },
        select: { id: true, name: true, email: true, phone: true },
    })

    return NextResponse.json({ user: updated })
}

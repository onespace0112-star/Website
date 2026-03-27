import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PATCH(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const { id, direction } = await request.json()
        const currentMember = await prisma.teamMember.findUnique({
            where: { id }
        })

        if (!currentMember) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        const members = await prisma.teamMember.findMany({
            orderBy: { order: 'asc' }
        })

        const currentIndex = members.findIndex((m: (typeof members)[number]) => m.id === id)
        let targetIndex = -1

        if (direction === 'up' && currentIndex > 0) {
            targetIndex = currentIndex - 1
        } else if (direction === 'down' && currentIndex < members.length - 1) {
            targetIndex = currentIndex + 1
        }

        if (targetIndex !== -1) {
            const targetMember = members[targetIndex]

            // Swap orders
            await prisma.$transaction([
                prisma.teamMember.update({
                    where: { id: currentMember.id },
                    data: { order: targetMember.order }
                }),
                prisma.teamMember.update({
                    where: { id: targetMember.id },
                    data: { order: currentMember.order }
                })
            ])
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reorder error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

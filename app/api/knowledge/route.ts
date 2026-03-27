import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()

    const where: any = { isActive: true }
    if (category) {
        where.category = category
    }
    if (q) {
        where.OR = [
            { title: { contains: q } },
            { content: { contains: q } },
            { tags: { contains: q } },
        ]
    }

    const items = await prisma.knowledgeBase.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    const categories = await prisma.knowledgeBase.findMany({
        where: { isActive: true, category: { not: null } },
        distinct: ['category'],
        select: { category: true },
    })

    return NextResponse.json({
        items,
        categories: categories.map(c => c.category).filter(Boolean),
    })
}

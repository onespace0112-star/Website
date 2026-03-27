import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    const faqs = await prisma.fAQ.findMany({
        orderBy: { order: 'asc' }
    })
    return NextResponse.json(faqs)
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const json = await request.json()
        const faq = await prisma.fAQ.create({
            data: json,
        })
        return NextResponse.json(faq)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating FAQ' }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const cases = await prisma.homeCase.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(cases)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch home cases' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const newCase = await prisma.homeCase.create({
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                order: body.order ? parseInt(body.order) : 0,
            }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增成功案例', `新增了案例: ${newCase.title}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(newCase)
    } catch (error) {
        console.error('HomeCase create error:', error)
        return NextResponse.json({ error: 'Failed to create home case' }, { status: 500 })
    }
}

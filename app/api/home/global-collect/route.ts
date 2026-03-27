
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const items = await prisma.homeGlobalCollect.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching home global collect' }, { status: 500 })
    }
}

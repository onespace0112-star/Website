import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const advantages = await prisma.homeAdvantage.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(advantages)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching home advantages' }, { status: 500 })
    }
}

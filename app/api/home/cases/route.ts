import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const cases = await prisma.homeCase.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(cases)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching home cases' }, { status: 500 })
    }
}

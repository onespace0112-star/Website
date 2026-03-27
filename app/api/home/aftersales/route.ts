import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const aftersales = await prisma.homeAfterSales.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(aftersales)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching home aftersales' }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const processes = await prisma.process.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(processes)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 })
    }
}

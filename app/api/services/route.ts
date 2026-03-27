
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const items = await prisma.serviceItem.findMany({
            include: {
                type: true
            },
            orderBy: {
                order: 'asc'
            }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }
}

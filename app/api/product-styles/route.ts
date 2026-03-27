import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const styles = await prisma.productStyle.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                }
            }
        })
        return NextResponse.json(styles)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

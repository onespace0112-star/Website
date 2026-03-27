import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'design'

        if (category === 'design') {
            const items = await prisma.designServicePackage.findMany({
                orderBy: { sortOrder: 'asc' }
            })
            return NextResponse.json(items)
        } else {
            const items = await prisma.procurementServicePackage.findMany({
                orderBy: { sortOrder: 'asc' }
            })
            return NextResponse.json(items)
        }
    } catch {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }
}

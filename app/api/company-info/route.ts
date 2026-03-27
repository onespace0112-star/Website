import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const item = await prisma.contactCompanyInfo.findFirst({
            orderBy: { updatedAt: 'desc' }
        })
        return NextResponse.json(item || null)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch company info' }, { status: 500 })
    }
}

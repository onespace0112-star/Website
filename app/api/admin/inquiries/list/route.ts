
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const inquiries = await prisma.inquiry.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(inquiries)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
    }
}

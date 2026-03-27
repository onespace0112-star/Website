import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/userAuth'
import prisma from '@/lib/prisma'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const items = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
}

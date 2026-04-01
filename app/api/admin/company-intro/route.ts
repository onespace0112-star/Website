
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const items = await prisma.companyIntro.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { fileUrl } = await req.json()
        if (!fileUrl) {
            return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 })
        }
        const item = await prisma.companyIntro.create({ data: { fileUrl } })
        await createLog('新增公司简介', `新增了公司简介文件 (ID: ${item.id})`)
        return NextResponse.json(item)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const items = await prisma.contactCompanyInfo.findMany({
            orderBy: { updatedAt: 'desc' }
        })
        return NextResponse.json(items)
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch company info' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const item = await prisma.contactCompanyInfo.create({
            data: {
                mapImageEn: body.mapImageEn || null,
                mapImageZh: body.mapImageZh || null,
                companyName: body.companyName || null,
                companyAddress: body.companyAddress || null,
                companyEmail: body.companyEmail || null,
                companyPhone: body.companyPhone || null,
                companyWebsite: body.companyWebsite || null
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增公司信息', `新增公司信息: ${item.companyName || '未命名'} (ID: ${item.id})`)
        } catch {}

        return NextResponse.json(item)
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create company info' }, { status: 500 })
    }
}

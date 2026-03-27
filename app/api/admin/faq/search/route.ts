
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.faqSearchFile.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch search files' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        if (!body.fileUrl) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }
        const newItem = await prisma.faqSearchFile.create({
            data: {
                fileUrl: body.fileUrl,
                fileName: body.fileName || null,
            }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('新增FAQ搜索文件', `新增了: ${newItem.fileName || newItem.fileUrl}`)
        } catch (e) { console.error(e) }
        return NextResponse.json(newItem)
    } catch (error) {
        console.error('FAQ search file create error:', error)
        return NextResponse.json({ error: 'Failed to create search file' }, { status: 500 })
    }
}

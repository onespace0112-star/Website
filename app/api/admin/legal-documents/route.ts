import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const docs = await prisma.legalDocument.findMany({
            orderBy: { type: 'asc' },
        })
        return NextResponse.json(docs)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { type, fileUrl, fileName, content } = body

        if (!type) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        const validTypes = ['terms_en', 'terms_zh', 'privacy_en', 'privacy_zh']
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: '无效的文档类型' }, { status: 400 })
        }

        const updateData: Record<string, string> = {}
        if (fileUrl !== undefined) updateData.fileUrl = fileUrl
        if (fileName !== undefined) updateData.fileName = fileName
        if (content !== undefined) updateData.content = content

        const doc = await prisma.legalDocument.upsert({
            where: { type },
            update: updateData,
            create: { type, fileUrl: fileUrl || '', fileName: fileName || '', content: content || '' },
        })

        // 记录日志（不影响主操作）
        try {
            const labelMap: Record<string, string> = {
                terms_en: '服务条款(英文版)',
                terms_zh: '服务条款(中文版)',
                privacy_en: '隐私政策(英文版)',
                privacy_zh: '隐私政策(中文版)',
            }
            await prisma.systemLog.create({
                data: {
                    action: '更新',
                    content: `登录管理：更新${labelMap[type] || type}${fileName ? ` [${fileName}]` : ''}`,
                },
            })
        } catch (logErr) {
            console.error('System log error (non-critical):', logErr)
        }

        return NextResponse.json(doc)
    } catch (err: any) {
        console.error('Legal document save error:', err)
        return NextResponse.json({ error: 'Failed to save', detail: err?.message || String(err) }, { status: 500 })
    }
}

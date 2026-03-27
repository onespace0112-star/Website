import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawId = params?.id
    const id = Number.parseInt(String(rawId), 10)
    if (!Number.isFinite(id) || id <= 0) {
        return NextResponse.json({ error: `Invalid id: ${rawId}` }, { status: 400 })
    }

    try {
        const body = await request.json()
        const item = await prisma.contactCompanyInfo.update({
            where: { id },
            data: {
                mapImageEn: body.mapImageEn ?? null,
                mapImageZh: body.mapImageZh ?? null,
                companyName: body.companyName ?? null,
                companyAddress: body.companyAddress ?? null,
                companyEmail: body.companyEmail ?? null,
                companyPhone: body.companyPhone ?? null,
                companyWebsite: body.companyWebsite ?? null
            }
        })

        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('修改公司信息', `修改公司信息: ${item.companyName || '未命名'} (ID: ${item.id})`)
        } catch { }

        return NextResponse.json(item)
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update company info' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawId = params?.id
    const id = Number.parseInt(String(rawId), 10)
    if (!Number.isFinite(id) || id <= 0) {
        return NextResponse.json({ error: `Invalid id: ${rawId}` }, { status: 400 })
    }

    try {
        await prisma.contactCompanyInfo.delete({ where: { id } })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除公司信息', `删除公司信息: ID ${id}`)
        } catch { }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete company info' }, { status: 500 })
    }
}

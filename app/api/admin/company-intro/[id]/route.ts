
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        const { fileUrl } = await req.json()
        const updated = await prisma.companyIntro.update({
            where: { id },
            data: { fileUrl }
        })
        await createLog('修改公司简介', `修改了公司简介文件 (ID: ${id})`)
        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update item', details: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const id = parseInt(params.id)
        await prisma.companyIntro.delete({ where: { id } })
        await createLog('删除公司简介', `删除了公司简介文件 (ID: ${id})`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete item', details: error.message }, { status: 500 })
    }
}

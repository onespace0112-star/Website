
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.faqSearchFile.delete({
            where: { id }
        })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除FAQ搜索文件', `删除了 ID: ${id}`)
        } catch (e) { console.error(e) }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete FAQ search file error:', error)
        return NextResponse.json({
            error: 'Failed to delete search file',
            details: error.message
        }, { status: 500 })
    }
}

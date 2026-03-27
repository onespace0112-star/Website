import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const items = await prisma.faqQuestionSubmission.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const id = idParam ? parseInt(idParam) : NaN
    if (!id || Number.isNaN(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        await prisma.faqQuestionSubmission.delete({ where: { id } })
        try {
            const { createLog } = await import('@/lib/logger')
            await createLog('删除FAQ问题', `删除了 ID: ${id}`)
        } catch (e) { console.error(e) }
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete question', details: error.message }, { status: 500 })
    }
}

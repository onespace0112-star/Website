
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'
import { serializeFAQ } from '@/lib/dto/faq'

function parseId(idStr: string): number | null {
    const id = Number.parseInt(idStr, 10)
    return Number.isFinite(id) ? id : null
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseId(idStr)
    if (id === null) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    try {
        const faq = await prisma.fAQ.findUnique({ where: { id } })
        if (!faq) {
            return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
        }

        return NextResponse.json(serializeFAQ(faq))
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseId(idStr)
    if (id === null) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()

    try {
        const data: Prisma.FAQUpdateInput = {}

        if (typeof body.question === 'string') data.question = body.question
        if (typeof body.answer === 'string') data.answer = body.answer
        if (typeof body.order === 'number') data.order = body.order
        if (typeof body.isActive === 'boolean') data.isActive = body.isActive
        if (body.typeId !== undefined) {
            if (body.typeId === null || body.typeId === '') {
                data.type = { disconnect: true }
            } else {
                const parsedTypeId = Number.parseInt(String(body.typeId), 10)
                if (Number.isFinite(parsedTypeId)) {
                    data.type = { connect: { id: parsedTypeId } }
                }
            }
        }

        const faq = await prisma.fAQ.update({
            where: { id },
            data
        })
        await createLog('修改FAQ', `修改了常见问题: ${faq.question} (ID: ${faq.id})`)
        return NextResponse.json(serializeFAQ(faq))
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseId(idStr)
    if (id === null) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    try {
        await prisma.fAQ.delete({
            where: { id }
        })
        await createLog('删除FAQ', `删除了常见问题 ID: ${id}`)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
    }
}

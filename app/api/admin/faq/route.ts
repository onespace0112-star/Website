
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'
import { parsePaginationParams } from '@/lib/pagination'
import { parseSortParams } from '@/lib/sort'
import { serializeFAQ, serializeFAQWithType, type FAQListResponse } from '@/lib/dto/faq'

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const searchParams = new URL(request.url).searchParams
        const { page, pageSize, skip, take } = parsePaginationParams(searchParams)

        const sortParams = new URLSearchParams(searchParams)
        const sort = searchParams.get('sort')
        if (sort) {
            sortParams.set('sortBy', sort)
        }

        const { prismaOrderBy } = parseSortParams(
            sortParams,
            ['id', 'order', 'createdAt', 'updatedAt', 'question', 'isActive'],
            'order'
        )

        const q = searchParams.get('q')?.trim()
        const typeIdParam = searchParams.get('typeId')
        const isActiveParam = searchParams.get('isActive')

        const typeId = typeIdParam ? Number.parseInt(typeIdParam, 10) : Number.NaN
        const isActive =
            isActiveParam === 'true'
                ? true
                : isActiveParam === 'false'
                    ? false
                    : null

        const where = {
            ...(q
                ? {
                    OR: [
                        { question: { contains: q, mode: 'insensitive' } },
                        { answer: { contains: q, mode: 'insensitive' } }
                    ]
                }
                : {}),
            ...(Number.isFinite(typeId) ? { typeId } : {}),
            ...(isActive === null ? {} : { isActive })
        }

        const [total, faqs] = await Promise.all([
            prisma.fAQ.count({ where }),
            prisma.fAQ.findMany({
                where,
                include: { type: true },
                orderBy: prismaOrderBy,
                skip,
                take
            })
        ])

        const items = faqs.map(serializeFAQWithType)
        const totalPages = Math.ceil(total / pageSize)

        const response: FAQListResponse = {
            items,
            total,
            page,
            pageSize,
            totalPages
        }

        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        if (!body.question || typeof body.question !== 'string' || body.question.trim() === '') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }
        if (!body.answer || typeof body.answer !== 'string' || body.answer.trim() === '') {
            return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
        }
        if (body.question.length > 1000) {
            return NextResponse.json({ error: 'Question must not exceed 1000 characters' }, { status: 400 })
        }
        if (body.answer.length > 10000) {
            return NextResponse.json({ error: 'Answer must not exceed 10000 characters' }, { status: 400 })
        }

        const parsedTypeId = body.typeId
            ? (() => { const n = Number.parseInt(String(body.typeId), 10); return Number.isFinite(n) ? n : null })()
            : null

        const faq = await prisma.fAQ.create({
            data: {
                question: body.question.trim(),
                answer: body.answer.trim(),
                order: body.order || 0,
                typeId: parsedTypeId,
                isActive: body.isActive ?? true
            }
        })
        await createLog('新增FAQ', `新增了常见问题: ${faq.question} (ID: ${faq.id})`)
        return NextResponse.json(serializeFAQ(faq))
    } catch (error) {
        console.error('FAQ create error:', error)
        return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
    }
}

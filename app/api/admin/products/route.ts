import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
export const dynamic = 'force-dynamic'

// GET - list all types, categories, products
export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const types = await prisma.productType.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                categories: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        products: {
                            orderBy: { sortOrder: 'asc' },
                        }
                    }
                }
            }
        })

        return NextResponse.json(types)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

// POST - create type, category, or product
export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { entity, ...data } = body

        if (entity === 'type') {
            const item = await prisma.productType.create({
                data: {
                    nameEn: data.nameEn || '',
                    nameZh: data.nameZh || '',
                    sortOrder: Number(data.sortOrder) || 0,
                }
            })
            await prisma.systemLog.create({
                data: { action: '新增', content: `产品管理：新增类型 [${data.nameEn}]` }
            })
            return NextResponse.json(item)
        }

        if (entity === 'category') {
            const item = await prisma.productCategory.create({
                data: {
                    nameEn: data.nameEn || '',
                    nameZh: data.nameZh || '',
                    typeId: Number(data.typeId),
                    sortOrder: Number(data.sortOrder) || 0,
                }
            })
            await prisma.systemLog.create({
                data: { action: '新增', content: `产品管理：新增分类 [${data.nameEn}]` }
            })
            return NextResponse.json(item)
        }

        if (entity === 'product') {
            const item = await prisma.product.create({
                data: {
                    nameEn: data.nameEn || '',
                    nameZh: data.nameZh || '',
                    image: data.image || '',
                    categoryId: Number(data.categoryId),
                    sortOrder: Number(data.sortOrder) || 0,
                }
            })
            await prisma.systemLog.create({
                data: { action: '新增', content: `产品管理：新增产品 [${data.nameEn}]` }
            })
            return NextResponse.json(item)
        }

        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}

// PATCH - update type, category, or product
export async function PATCH(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { entity, id, ...data } = body
        const numId = Number(id)

        if (entity === 'type') {
            const item = await prisma.productType.update({
                where: { id: numId },
                data: {
                    nameEn: data.nameEn,
                    nameZh: data.nameZh,
                    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                }
            })
            return NextResponse.json(item)
        }

        if (entity === 'category') {
            const item = await prisma.productCategory.update({
                where: { id: numId },
                data: {
                    nameEn: data.nameEn,
                    nameZh: data.nameZh,
                    typeId: data.typeId !== undefined ? Number(data.typeId) : undefined,
                    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                }
            })
            return NextResponse.json(item)
        }

        if (entity === 'product') {
            const item = await prisma.product.update({
                where: { id: numId },
                data: {
                    nameEn: data.nameEn,
                    nameZh: data.nameZh,
                    image: data.image,
                    categoryId: data.categoryId !== undefined ? Number(data.categoryId) : undefined,
                    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                }
            })
            return NextResponse.json(item)
        }

        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

// DELETE - delete type, category, or product
export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { entity, id } = body
        const numId = Number(id)

        if (entity === 'type') {
            await prisma.productType.delete({ where: { id: numId } })
        } else if (entity === 'category') {
            await prisma.productCategory.delete({ where: { id: numId } })
        } else if (entity === 'product') {
            await prisma.product.delete({ where: { id: numId } })
        } else {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
        }

        await prisma.systemLog.create({
            data: { action: '删除', content: `产品管理：删除${entity} #${numId}` }
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}

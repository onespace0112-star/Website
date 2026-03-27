import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = Number(idStr)
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    try {
        const body = await request.json()
        const { category, ...data } = body

        if (category === 'design') {
            const item = await prisma.designServicePackage.update({
                where: { id },
                data: {
                    serviceType: data.serviceType,
                    houseArea: data.houseArea,
                    fee: data.fee,
                    serviceItems: data.serviceItems,
                    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                }
            })
            await prisma.systemLog.create({
                data: { action: '修改', content: `服务体系：修改设计服务 #${id}` }
            })
            return NextResponse.json(item)
        } else {
            const item = await prisma.procurementServicePackage.update({
                where: { id },
                data: {
                    serviceType: data.serviceType,
                    fee: data.fee,
                    serviceItems: data.serviceItems,
                    travelTime: data.travelTime,
                    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                }
            })
            await prisma.systemLog.create({
                data: { action: '修改', content: `服务体系：修改采购服务 #${id}` }
            })
            return NextResponse.json(item)
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = Number(idStr)
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    try {
        const { searchParams } = new URL(_request.url)
        const category = searchParams.get('category') || 'design'

        if (category === 'design') {
            await prisma.designServicePackage.delete({ where: { id } })
        } else {
            await prisma.procurementServicePackage.delete({ where: { id } })
        }

        await prisma.systemLog.create({
            data: { action: '删除', content: `服务体系：删除${category === 'design' ? '设计' : '采购'}服务 #${id}` }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }
}

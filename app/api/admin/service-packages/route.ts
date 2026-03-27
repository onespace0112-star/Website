import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'design'

        if (category === 'design') {
            const items = await prisma.designServicePackage.findMany({
                orderBy: { sortOrder: 'asc' }
            })
            return NextResponse.json(items)
        } else {
            const items = await prisma.procurementServicePackage.findMany({
                orderBy: { sortOrder: 'asc' }
            })
            return NextResponse.json(items)
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { category, ...data } = body

        if (category === 'design') {
            const item = await prisma.designServicePackage.create({
                data: {
                    serviceType: data.serviceType || '',
                    houseArea: data.houseArea || '',
                    fee: data.fee || '',
                    serviceItems: data.serviceItems || '',
                    sortOrder: Number(data.sortOrder) || 0,
                }
            })
            await prisma.systemLog.create({
                data: { action: '新增', content: `服务体系：新增设计服务 [${data.serviceType}]` }
            })
            return NextResponse.json(item)
        } else {
            const item = await prisma.procurementServicePackage.create({
                data: {
                    serviceType: data.serviceType || '',
                    fee: data.fee || '',
                    serviceItems: data.serviceItems || '',
                    travelTime: data.travelTime || '',
                    sortOrder: Number(data.sortOrder) || 0,
                }
            })
            await prisma.systemLog.create({
                data: { action: '新增', content: `服务体系：新增采购服务 [${data.serviceType}]` }
            })
            return NextResponse.json(item)
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }
}

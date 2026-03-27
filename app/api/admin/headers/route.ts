
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { serializePageHeader } from '@/lib/dto/pageHeader'

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')

    try {
        const headers = await prisma.pageHeader.findMany({
            where: page ? { page } : {},
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(headers.map(serializePageHeader))
    } catch (error: any) {
        console.error('Fetch headers error:', error)
        return NextResponse.json({ error: 'Failed to fetch headers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        if (!body.page || !body.title) {
            return NextResponse.json({ error: 'Page and Title are required' }, { status: 400 })
        }

        const newHeader = await prisma.pageHeader.create({
            data: {
                page: body.page,
                title: body.title,
                description: body.description,
                image: body.image,
                height: body.height ? Number(body.height) : 400
            }
        })

        // Log
        try {
            const logContent = `头部管理：新增头部 - ${body.page} - ${body.title}`;
            await prisma.systemLog.create({
                data: { action: '增加', content: logContent }
            })
        } catch (logError) {
            console.error('Failed to write system log', logError)
        }

        return NextResponse.json(serializePageHeader(newHeader))
    } catch (error: any) {
        console.error('Create header error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create header' }, { status: 500 })
    }
}


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const typeId = searchParams.get('typeId')

        const where: any = {}
        if (status) where.status = status
        if (typeId) where.typeId = parseInt(typeId)

        const items = await prisma.feedback.findMany({
            where,
            include: {
                type: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: '请先登录后再提交反馈' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Handle typeName for static types from frontend
        const { typeName, typeId, ...rest } = body
        const data: any = { ...rest }
        data.customerName = currentUser.name || null
        data.contact = currentUser.phone || currentUser.email || null

        if (typeName) {
            data.type = {
                connectOrCreate: {
                    where: { name: typeName },
                    create: { name: typeName }
                }
            }
        } else if (typeId) {
            data.typeId = parseInt(typeId)
        }

        const item = await prisma.feedback.create({
            data
        })
        return NextResponse.json(item)
    } catch (error) {
        console.error('Create feedback error:', error)
        return NextResponse.json(
            { error: 'Failed to create feedback' },
            { status: 500 }
        )
    }
}

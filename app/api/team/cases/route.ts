import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const cases = await prisma.teamCase.findMany({
            include: {
                members: {
                    include: {
                        member: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(cases)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching cases' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const json = await request.json()
        const teamCase = await prisma.teamCase.create({
            data: {
                name: json.name,
                image: json.image,
            },
        })
        return NextResponse.json(teamCase)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating case' }, { status: 500 })
    }
}

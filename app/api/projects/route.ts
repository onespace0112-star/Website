import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    const projects = await prisma.project.findMany({
        include: {
            type: true
        },
        orderBy: { order: 'asc' }
    })
    return NextResponse.json(projects)
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const json = await request.json()
        const project = await prisma.project.create({
            data: json,
        })
        return NextResponse.json(project)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating project' }, { status: 500 })
    }
}

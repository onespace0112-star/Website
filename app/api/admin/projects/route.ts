
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const projects = await prisma.project.findMany({
            include: { type: true },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(projects)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const rawTypeId = body.typeId ?? body.typel
        const parsedTypeId = rawTypeId !== undefined && rawTypeId !== null && rawTypeId !== ''
            ? parseInt(String(rawTypeId))
            : null
        const data: any = {
            title: body.title,
            type: parsedTypeId ? { connect: { id: parsedTypeId } } : undefined,
            coverImage: body.coverImage,
            fileUrl: body.fileUrl || null,
            area: body.area ? String(body.area) : '',
            location: body.location,
            budgetRange: body.budgetRange || null,
            timeline: body.timeline || null,
            deliverables: body.deliverables || null,
            order: body.order ? parseInt(String(body.order)) : 0,
            slug: body.slug || `project-${Date.now()}`,
            description: body.description || '',
            content: body.content || ''
        }

        let project
        try {
            project = await prisma.project.create({ data })
        } catch (error: any) {
            // Compatible with old Prisma client/schema that doesn't include fileUrl yet.
            if (String(error?.message || '').includes('Unknown argument `fileUrl`')) {
                delete data.fileUrl
                project = await prisma.project.create({ data })
            } else {
                throw error
            }
        }
        await createLog('新增项目', `新增了项目: ${project.title} (ID: ${project.id})`)
        return NextResponse.json(project)
    } catch (error: any) {
        console.error('Project create error:', error)
        return NextResponse.json({
            error: 'Failed to create project',
            details: error.message
        }, { status: 500 })
    }
}

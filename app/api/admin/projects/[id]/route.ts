
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const rawTypeId = body.typeId ?? body.typel
    const parsedTypeId = rawTypeId !== undefined && rawTypeId !== null && rawTypeId !== ''
        ? parseInt(String(rawTypeId))
        : null

    try {
        const data: any = {
            title: body.title,
            type: parsedTypeId
                ? { connect: { id: parsedTypeId } }
                : { disconnect: true },
            coverImage: body.coverImage,
            fileUrl: body.fileUrl ?? null,
            area: body.area ? String(body.area) : null,
            location: body.location,
            budgetRange: body.budgetRange ?? null,
            timeline: body.timeline ?? null,
            deliverables: body.deliverables ?? null,
            order: body.order ? parseInt(String(body.order)) : 0,
            updatedAt: new Date()
        }

        let project
        try {
            project = await prisma.project.update({ where: { id }, data })
        } catch (error: any) {
            // Compatible with old Prisma client/schema that doesn't include fileUrl yet.
            if (String(error?.message || '').includes('Unknown argument `fileUrl`')) {
                delete data.fileUrl
                project = await prisma.project.update({ where: { id }, data })
            } else {
                throw error
            }
        }
        await createLog('修改项目', `修改了项目: ${project.title} (ID: ${project.id})`)
        return NextResponse.json(project)
    } catch (error: any) {
        console.error('Update Project Error:', error)
        return NextResponse.json({
            error: 'Failed to update project',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    try {
        await prisma.project.delete({
            where: { id }
        })
        await createLog('删除项目', `删除了项目 ID: ${id}`)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}

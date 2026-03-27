
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { serializePageHeader } from '@/lib/dto/pageHeader'

async function handleUpdate(
    request: Request,
    params: Promise<{ id: string }>
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params;
    const idStr = resolvedParams.id;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return NextResponse.json({ error: `Invalid ID: ${idStr}` }, { status: 400 });
    }

    try {
        const body = await request.json()
        // Fetch existing verification for logging
        const existing = await prisma.pageHeader.findUnique({ where: { id } });

        if (existing) {
            const changes = [];
            if (body.title !== undefined && body.title !== existing.title) changes.push(`标题: ${existing.title} -> ${body.title}`);
            if (body.description !== undefined && body.description !== existing.description) changes.push(`描述: ${existing.description || '无'} -> ${body.description || '无'}`);
            if (body.image !== undefined && body.image !== existing.image) changes.push(`图片: 已更新`);
            // Height change logging
            const oldHeight = existing.height || 400;
            const newHeight = body.height !== undefined ? Number(body.height) : oldHeight;
            if (newHeight !== oldHeight) {
                changes.push(`高度: ${oldHeight} -> ${newHeight}`);
            }

            if (changes.length > 0) {
                const logContent = `头部管理：修改头部 [${existing.page}] - ${changes.join(', ')}`;
                await prisma.systemLog.create({
                    data: { action: '修改', content: logContent }
                })
            }
        }

        const updated = await prisma.pageHeader.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                image: body.image,
                height: body.height !== undefined ? Number(body.height) : undefined
            }
        })

        return NextResponse.json(serializePageHeader(updated))
    } catch (error: any) {
        console.error(`Error updating header ${id}:`, error);
        return NextResponse.json({ error: 'Failed to update header' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleUpdate(request, params)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleUpdate(request, params)
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params;
    const idStr = resolvedParams.id;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        // Fetch before delete for logging
        const existing = await prisma.pageHeader.findUnique({ where: { id } });

        if (existing) {
            const logContent = `头部管理：删除头部 [${existing.page}] - 标题: ${existing.title}, 高度: ${existing.height || 400}, 图片: ${existing.image || '无'}`;
            await prisma.systemLog.create({
                data: { action: '删除', content: logContent }
            })
        }

        await prisma.pageHeader.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete header' }, { status: 500 })
    }
}

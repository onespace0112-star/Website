import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const teamMember = await prisma.teamMember.findUnique({
            where: { id: parseInt(id) }
        })

        if (!teamMember) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json(teamMember)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching team member' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const { id } = await params
    try {
        const json = await request.json()
         
        const { id: _, cases: __, ...updateData } = json // Exclude relations/id

        // Remove null values for non-nullable fields or convert them
        if (updateData.order === null || updateData.order === undefined) {
            delete updateData.order
        } else {
            updateData.order = parseInt(updateData.order)
        }

        const teamMember = await prisma.teamMember.update({
            where: { id: parseInt(id) },
            data: updateData
        })

        // Log action
        // Log action
        try {
            await prisma.systemLog.create({
                data: {
                    action: '修改',
                    content: `团队管理：修改团队成员信息 (ID: ${id}) - ${teamMember.name}`,
                }
            })
        } catch (logError) {
            console.error('Failed to log action:', logError)
        }

        return NextResponse.json(teamMember)
    } catch (error) {
        console.error('Update team member error:', error)
        return NextResponse.json({ error: 'Error updating team member' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const { id } = await params
    try {
        await prisma.teamMember.delete({
            where: { id: parseInt(id) }
        })

        // Log action
        // Log action
        try {
            await prisma.systemLog.create({
                data: {
                    action: '删除',
                    content: `团队管理：删除团队成员 (ID: ${id})`,
                }
            })
        } catch (logError) {
            console.error('Failed to log action:', logError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting team member' }, { status: 500 })
    }
}

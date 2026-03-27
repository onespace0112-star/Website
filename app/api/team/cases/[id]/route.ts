import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const { id: idStr } = await params
        const id = Number.parseInt(idStr, 10)
        if (!Number.isFinite(id)) {
            return NextResponse.json({ error: 'Invalid case id' }, { status: 400 })
        }

        await prisma.teamCase.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting case' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const { id: idStr } = await params
        const id = Number.parseInt(idStr, 10)
        if (!Number.isFinite(id)) {
            return NextResponse.json({ error: 'Invalid case id' }, { status: 400 })
        }

        const json = await request.json()
        const teamCase = await prisma.teamCase.update({
            where: { id },
            data: json,
        })
        return NextResponse.json(teamCase)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating case' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { order: 'asc' },
            include: {
                cases: {
                    include: {
                        case: true
                    }
                }
            }
        })
        return NextResponse.json(teamMembers)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching team members' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const json = await request.json()
        const teamMember = await prisma.teamMember.create({
            data: json,
        })

        // Log action
        await prisma.systemLog.create({
            data: {
                action: '增加',
                content: `团队管理：新增团队成员 - ${teamMember.name}`,
            }
        })

        return NextResponse.json(teamMember)
    } catch (error) {
        console.error('Error creating team member:', error)
        return NextResponse.json({ error: 'Error creating team member' }, { status: 500 })
    }
}

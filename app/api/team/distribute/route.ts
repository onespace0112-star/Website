import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    try {
        const { memberId, caseId } = await request.json()

        const distribution = await (prisma as any).teamCaseDistribution.upsert({
            where: {
                memberId_caseId: {
                    memberId: parseInt(memberId),
                    caseId: parseInt(caseId)
                }
            },
            update: {},
            create: {
                memberId: parseInt(memberId),
                caseId: parseInt(caseId)
            }
        })

        return NextResponse.json(distribution)
    } catch (error) {
        console.error('Distribution error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

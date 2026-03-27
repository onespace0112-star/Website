
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const types = await prisma.feedbackIssueType.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(types)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch issue types' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const existing = await prisma.feedbackIssueType.findUnique({
            where: { name }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Issue type with this name already exists' },
                { status: 400 }
            )
        }

        const type = await prisma.feedbackIssueType.create({
            data: { name }
        })

        return NextResponse.json(type)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create issue type' },
            { status: 500 }
        )
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const question = String(body.question || '').trim()
        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }
        const currentUser = await getCurrentUser()
        const item = await prisma.faqQuestionSubmission.create({
            data: {
                name: currentUser?.name || body.name || null,
                email: currentUser?.email || body.email || null,
                phone: currentUser?.phone || body.phone || null,
                question,
            }
        })
        return NextResponse.json({ success: true, id: item.id })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 })
    }
}

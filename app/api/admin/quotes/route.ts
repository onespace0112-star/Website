
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET() {
    try {
        const quotes = await prisma.quote.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(quotes)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }
}

// Optional: for manual creation if needed
export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const body = await request.json()
        const quote = await prisma.quote.create({
            data: body
        })
        return NextResponse.json(quote)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
    }
}

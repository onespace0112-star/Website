import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const lang = searchParams.get('lang') || 'en'

        if (!type || (type !== 'terms' && type !== 'privacy')) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        const key = `${type}_${lang}`
        const doc = await prisma.legalDocument.findUnique({
            where: { type: key },
        })

        if (!doc) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json(doc)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

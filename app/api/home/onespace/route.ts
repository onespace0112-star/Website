import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const onespace = await prisma.homeOnespace.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(onespace)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching home onespace' }, { status: 500 })
    }
}

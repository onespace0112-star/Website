import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const types = await prisma.productType.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                categories: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        products: {
                            orderBy: { sortOrder: 'asc' },
                        }
                    }
                }
            }
        })

        return NextResponse.json(types)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

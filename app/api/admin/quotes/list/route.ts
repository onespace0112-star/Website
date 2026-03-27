
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    // const isAdmin = await checkAdmin()
    // if (!isAdmin) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const quotes = await prisma.quote.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Map Quote fields to match frontend expectations
        const mappedQuotes = quotes.map((quote: any) => ({
            id: quote.id,
            name: quote.projectName,
            email: quote.email,
            phone: quote.phone,
            country: quote.country,
            projectType: quote.projectType,
            propertyType: quote.propertyType,
            expectedTimeline: quote.expectedTimeline,
            surfaceArea: quote.surfaceArea,
            budgetRange: quote.budgetRange,
            floorPlanStatus: quote.floorPlanStatus,
            role: quote.role,
            contactMethod: quote.contactMethod,
            contactTime: quote.contactTime,
            description: quote.description,
            note: quote.note,
            projectName: quote.projectName,
            createdAt: quote.createdAt
        }))

        return NextResponse.json(mappedQuotes)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }
}

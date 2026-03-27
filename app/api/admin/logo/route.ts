
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

// Define a type for the raw query result
interface RawLogo {
    id: number
    image: string
    width: number
    height: number
    createdAt: string
    updatedAt: string
}

export async function GET() {
    try {
        // Use raw query to bypass stale Prisma Client definition
        const logos = await prisma.$queryRaw<RawLogo[]>`SELECT * FROM SiteLogo ORDER BY id DESC LIMIT 1`
        const logo = logos[0] || null
        return NextResponse.json(logo)
    } catch (error) {
        console.error('Fetch logo error', error)
        return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const { createLog } = await import('@/lib/logger')

        // Fetch existing using raw query
        const existingLogs = await prisma.$queryRaw<RawLogo[]>`SELECT * FROM SiteLogo ORDER BY id DESC LIMIT 1`
        const existing = existingLogs[0]

        const width = body.width ? parseInt(String(body.width)) : 40
        const height = body.height ? parseInt(String(body.height)) : 40
        const image = body.image
        const now = new Date().toISOString() // SQLite raw insert needs standard date string usually, or let Prisma handle via param

        let result;
        if (existing) {
            // Update
            // SQLite update
            await prisma.$executeRaw`UPDATE SiteLogo SET image = ${image}, width = ${width}, height = ${height}, updatedAt = ${new Date()} WHERE id = ${existing.id}`

            // Re-fetch to return
            const updatedLogs = await prisma.$queryRaw<RawLogo[]>`SELECT * FROM SiteLogo WHERE id = ${existing.id}`
            result = updatedLogs[0]

            await createLog('修改Logo', '更新了网站Logo')
        } else {
            // Create
            // SQLite insert
            await prisma.$executeRaw`INSERT INTO SiteLogo (image, width, height, createdAt, updatedAt) VALUES (${image}, ${width}, ${height}, ${new Date()}, ${new Date()})`

            // Re-fetch latest
            const newLogs = await prisma.$queryRaw<RawLogo[]>`SELECT * FROM SiteLogo ORDER BY id DESC LIMIT 1`
            result = newLogs[0]

            await createLog('新增Logo', '新增了网站Logo')
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Logo update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { createLog } = await import('@/lib/logger')
        // Delete all
        await prisma.$executeRaw`DELETE FROM SiteLogo`
        await createLog('删除Logo', '删除了网站Logo')
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

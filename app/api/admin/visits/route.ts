import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') || '24h' // 1h, 3h, 6h, 12h, 24h, 3d, 7d, 15d, 30d

        const now = new Date()
        const startTime = new Date()

        let intervalMinutes = 60 // Default grouping interval (1 hour)
        let format = 'HH:mm'

        switch (range) {
            case '1h':
                startTime.setHours(now.getHours() - 1)
                intervalMinutes = 5 // Group by 5 mins
                break
            case '3h':
                startTime.setHours(now.getHours() - 3)
                intervalMinutes = 15
                break
            case '6h':
                startTime.setHours(now.getHours() - 6)
                intervalMinutes = 30
                break
            case '12h':
                startTime.setHours(now.getHours() - 12)
                intervalMinutes = 60
                break
            case '24h': // Today/24h
                startTime.setHours(now.getHours() - 24)
                intervalMinutes = 60
                break
            case '3d':
                startTime.setDate(now.getDate() - 3)
                intervalMinutes = 60 * 4 // 4 hours
                format = 'MM-dd HH:mm'
                break
            case '7d':
                startTime.setDate(now.getDate() - 7)
                intervalMinutes = 60 * 12 // 12 hours
                format = 'MM-dd'
                break
            case '15d':
                startTime.setDate(now.getDate() - 15)
                intervalMinutes = 60 * 24 // 1 day
                format = 'MM-dd'
                break
            case '30d':
                startTime.setDate(now.getDate() - 30)
                intervalMinutes = 60 * 24 // 1 day
                format = 'MM-dd'
                break
            default:
                startTime.setDate(now.getDate() - 1)
        }

        // 1. Get total unique visits (UV) in this range
        const totalVisitsResult = await prisma.visitLog.groupBy({
            by: ['ip'],
            where: {
                createdAt: {
                    gte: startTime
                }
            }
        })
        const totalVisits = totalVisitsResult.length

        // 2. Calculate Cumulative Total (Sum of daily UVs for all time)
        // Group all logs by date and count unique IPs per date
        const allLogs = await prisma.visitLog.findMany({
            select: { createdAt: true, ip: true }
        })

        const dailyUvMap = new Map<string, Set<string>>()
        allLogs.forEach((log: { createdAt: Date, ip: string }) => {
            const dateKey = log.createdAt.toISOString().split('T')[0]
            if (!dailyUvMap.has(dateKey)) {
                dailyUvMap.set(dateKey, new Set())
            }
            dailyUvMap.get(dateKey)!.add(log.ip)
        })

        let cumulativeTotal = 0
        dailyUvMap.forEach(ips => {
            cumulativeTotal += ips.size
        })

        // 3. Get chart data
        // Prisma doesn't support advanced time truncation/grouping natively across all DBs easily
        // For SQLite/basic usage, we can fetch raw within range and group in JS, 
        // or use simple raw query. JS grouping is safer for DB portability for small datasets.

        const logs = allLogs.filter((log: { createdAt: Date, ip: string }) => log.createdAt >= startTime)
            .sort((a: { createdAt: Date }, b: { createdAt: Date }) => a.createdAt.getTime() - b.createdAt.getTime())

        // Grouping Logic - Count Unique IPs (UV) per slot
        const groupedData = new Map<string, Set<string>>()
        const timeSlots: string[] = []

        // Create empty time slots first to ensure continuous line
        let currentSlot = new Date(startTime.getTime())
        // Align to nearest interval
        currentSlot.setMinutes(Math.floor(currentSlot.getMinutes() / intervalMinutes) * intervalMinutes)
        currentSlot.setSeconds(0)
        currentSlot.setMilliseconds(0)

        while (currentSlot <= now) {
            const label = formatDate(currentSlot, range)
            if (!groupedData.has(label)) {
                groupedData.set(label, new Set())
                timeSlots.push(label)
            }
            currentSlot = new Date(currentSlot.getTime() + intervalMinutes * 60 * 1000)
        }

        // Fill data
        logs.forEach((log: any) => {
            // Find which slot this log belongs to
            // This is a simplified matching. Ideally we round the log time to the nearest slot.
            // For now, let's just format the log time using the same formatter and approximate.

            // Better: round the log time
            const logTime = new Date(log.createdAt)
            const roundedLogTime = roundTime(logTime, intervalMinutes)
            const label = formatDate(roundedLogTime, range)

            if (groupedData.has(label)) {
                groupedData.get(label)!.add(log.ip)
            }
        })

        const chartData = timeSlots.map(time => ({
            time,
            count: groupedData.get(time)?.size || 0
        }))

        return NextResponse.json({
            total: totalVisits,
            cumulativeTotal,
            chartData
        })

    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}

function roundTime(date: Date, intervalMinutes: number): Date {
    const ms = 1000 * 60 * intervalMinutes
    return new Date(Math.floor(date.getTime() / ms) * ms)
}

function formatDate(date: Date, range: string): string {
    const m = date.getMonth() + 1
    const d = date.getDate()
    const h = date.getHours()
    const min = date.getMinutes()

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (['1h', '3h', '6h', '12h', '24h'].includes(range)) {
        return `${pad(h)}:${pad(min)}`
    } else {
        return `${m}/${d}`
    }
}

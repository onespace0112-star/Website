import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'

function extractSearchKeyword(referrer: string): string {
    if (!referrer) return '-'
    try {
        const url = new URL(referrer)
        const q = url.searchParams.get('q') || url.searchParams.get('wd') || url.searchParams.get('query') || url.searchParams.get('keyword')
        return q || '-'
    } catch {
        return '-'
    }
}

function getReferrerHost(referrer: string): string {
    if (!referrer) return '-'
    try {
        return new URL(referrer).hostname || '-'
    } catch {
        return '-'
    }
}

export async function GET(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const range = searchParams.get('range') || '7d'

        const now = new Date()
        const startTime = new Date()
        switch (range) {
            case '1d': startTime.setDate(now.getDate() - 1); break
            case '7d': startTime.setDate(now.getDate() - 7); break
            case '30d': startTime.setDate(now.getDate() - 30); break
            default: startTime.setDate(now.getDate() - 7)
        }

        const [total, logs] = await Promise.all([
            prisma.visitLog.count({ where: { createdAt: { gte: startTime } } }),
            prisma.visitLog.findMany({
                where: { createdAt: { gte: startTime } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ])

        // Count visits per IP in range
        const ipCountMap = await prisma.visitLog.groupBy({
            by: ['ip'],
            where: { createdAt: { gte: startTime } },
            _count: { ip: true },
        })
        const ipCount = new Map(ipCountMap.map(r => [r.ip, r._count.ip]))

        const rows = logs.map(log => ({
            id: log.id,
            source: log.source || 'Direct',
            referrerHost: getReferrerHost(log.referrer || ''),
            searchKeyword: extractSearchKeyword(log.referrer || ''),
            browser: (log as any).browser || 'Unknown',
            os: (log as any).os || 'Unknown',
            device: (log as any).device || 'Desktop',
            visitTime: log.createdAt,
            path: log.path || '/',
            ip: log.ip,
            visitCount: ipCount.get(log.ip) || 1,
        }))

        return NextResponse.json({ total, page, pageSize, rows })
    } catch (error) {
        console.error('visit-stats error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

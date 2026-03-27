
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 1. Fetch all Quotes
        const quotes = await prisma.quote.findMany({
            select: {
                id: true,
                country: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch all Inquiries (Intents)
        const inquiries = await prisma.inquiry.findMany({
            select: {
                id: true,
                country: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Aggregate Quote Stats
        const totalQuotes = quotes.length;
        const monthlyQuotes = quotes.filter(q => new Date(q.createdAt) >= currentMonthStart).length;

        // Group by Country for Quotes
        const quoteCountryMap = new Map<string, { total: number, monthly: number }>();

        quotes.forEach(q => {
            const country = q.country || 'Unknown';
            if (!quoteCountryMap.has(country)) {
                quoteCountryMap.set(country, { total: 0, monthly: 0 });
            }
            const stat = quoteCountryMap.get(country)!;
            stat.total++;
            if (new Date(q.createdAt) >= currentMonthStart) {
                stat.monthly++;
            }
        });

        const quoteStats = Array.from(quoteCountryMap.entries()).map(([country, stats]) => ({
            country,
            cumulative: stats.total,
            monthly: stats.monthly
        })).sort((a, b) => b.cumulative - a.cumulative);


        // 4. Aggregate Intent Stats (Inquiries)
        const totalIntents = inquiries.length;
        const monthlyIntents = inquiries.filter(i => new Date(i.createdAt) >= currentMonthStart).length;

        // Group by Country for Intents
        const intentCountryMap = new Map<string, { total: number, monthly: number }>();

        inquiries.forEach(i => {
            const country = i.country || 'Unknown';
            if (!intentCountryMap.has(country)) {
                intentCountryMap.set(country, { total: 0, monthly: 0 });
            }
            const stat = intentCountryMap.get(country)!;
            stat.total++;
            if (new Date(i.createdAt) >= currentMonthStart) {
                stat.monthly++;
            }
        });

        const intentStats = Array.from(intentCountryMap.entries()).map(([country, stats]) => ({
            country,
            cumulative: stats.total,
            monthly: stats.monthly
        })).sort((a, b) => b.cumulative - a.cumulative);


        // 5. Deal Users (Mock for now as per requirement analysis)
        const totalDeals = 0; // Replace with prisma.order.count() if available later

        // 6. Cumulative Users
        const cumulativeUsers = totalQuotes + totalIntents + totalDeals;

        // 7. Customer source stats (UV by source)
        // Keep this block resilient so /admin still renders even if source fields are not migrated yet.
        let sourceStats: Array<{ source: string; country: string; daily: number; monthly: number; total: number }> = []
        let sourceTotals = { daily: 0, monthly: 0, total: 0 }
        try {
            const sourceDailyRows = await prisma.visitLog.groupBy({
                by: ['source', 'ip'],
                where: {
                    createdAt: { gte: todayStart }
                }
            })

            const sourceMonthlyRows = await prisma.visitLog.groupBy({
                by: ['source', 'ip'],
                where: {
                    createdAt: { gte: currentMonthStart }
                }
            })

            const sourceTotalRows = await prisma.visitLog.groupBy({
                by: ['source', 'ip']
            })

            const sourceCountryRows = await prisma.visitLog.groupBy({
                by: ['source', 'country', 'ip']
            })

            const sourceMap = new Map<string, { daily: number; monthly: number; total: number; country: string }>()
            const sourceCountryMap = new Map<string, Map<string, number>>()

            const ensureSource = (source: string) => {
                const key = source || 'Direct'
                if (!sourceMap.has(key)) {
                    sourceMap.set(key, { daily: 0, monthly: 0, total: 0, country: 'Unknown' })
                }
                return sourceMap.get(key)!
            }

            sourceDailyRows.forEach((row: any) => {
                ensureSource(row.source).daily += 1
            })
            sourceMonthlyRows.forEach((row: any) => {
                ensureSource(row.source).monthly += 1
            })
            sourceTotalRows.forEach((row: any) => {
                ensureSource(row.source).total += 1
            })

            sourceCountryRows.forEach((row: any) => {
                const sourceKey = row.source || 'Direct'
                const countryKey = row.country || 'Unknown'
                if (!sourceCountryMap.has(sourceKey)) {
                    sourceCountryMap.set(sourceKey, new Map())
                }
                const countryMap = sourceCountryMap.get(sourceKey)!
                countryMap.set(countryKey, (countryMap.get(countryKey) || 0) + 1)
            })

            sourceStats = Array.from(sourceMap.entries())
                .map(([source, stats]) => {
                    const countryMap = sourceCountryMap.get(source)
                    let topCountry = 'Unknown'
                    if (countryMap && countryMap.size > 0) {
                        const validCountries = Array.from(countryMap.entries())
                            .filter(([c]) => c && c !== 'Unknown')
                            .sort((a, b) => b[1] - a[1])

                        if (validCountries.length > 0) {
                            topCountry = validCountries.map(([c]) => c).join(', ')
                        } else {
                            topCountry = 'Unknown'
                        }
                    }
                    return { source, country: topCountry, daily: stats.daily, monthly: stats.monthly, total: stats.total, quoteCount: 0, inquiryCount: 0 }
                })
                .sort((a, b) => b.total - a.total)

            // Count quotes and inquiries per source
            const quotesBySource = await (prisma as any).quote.groupBy({ by: ['source'], _count: { id: true } })
            const inquiriesBySource = await (prisma as any).inquiry.groupBy({ by: ['source'], _count: { id: true } })
            const quoteCountBySource = new Map<string, number>(quotesBySource.map((r: any) => [r.source || 'Direct', r._count.id]))
            const inquiryCountBySource = new Map<string, number>(inquiriesBySource.map((r: any) => [r.source || 'Direct', r._count.id]))
            sourceStats = sourceStats.map(row => ({
                ...row,
                quoteCount: quoteCountBySource.get(row.source) || 0,
                inquiryCount: inquiryCountBySource.get(row.source) || 0,
            }))

            sourceTotals = sourceStats.reduce(
                (acc, item) => {
                    acc.daily += item.daily
                    acc.monthly += item.monthly
                    acc.total += item.total
                    return acc
                },
                { daily: 0, monthly: 0, total: 0 }
            )
        } catch (sourceError) {
            console.warn('Source stats unavailable (likely missing migration):', sourceError)
        }


        return NextResponse.json({
            cards: {
                cumulativeUsers,
                totalQuotes,
                totalIntents,
                totalDeals,
            },
            stats: {
                quoteStats,
                intentStats,
                dealStats: [],
                sourceStats,
                sourceTotals
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}

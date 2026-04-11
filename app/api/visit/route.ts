import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

// Lazy load or handle data dir
let geoip: any = null

try {
    // Try to locate the data directory
    const dataDir = path.join(process.cwd(), 'node_modules', 'geoip-lite', 'data')
    if (fs.existsSync(dataDir)) {
        // @ts-expect-error geoip-lite reads from a global datadir variable
        global.geoip_datadir = dataDir
        process.env.GEOIP_DATADIR = dataDir
    }

    // Construct real path because require.resolve returns virtual path in Turbopack
    const geoipPath = path.join(process.cwd(), 'node_modules', 'geoip-lite', 'lib', 'geoip.js')

    // Bypass webpack/turbopack bundling using run-time require
    const runtimeRequire = eval('require')
    geoip = runtimeRequire(geoipPath)
} catch (e) {
    console.error('Failed to load geoip-lite:', e)
}

function detectSource(path: string, referrer: string, explicitSource?: string | null) {
    const rawSource = (explicitSource || '').trim()
    if (rawSource) return rawSource

    try {
        const url = new URL(path, 'https://onespace.local')
        const utm = (url.searchParams.get('utm_source') || '').trim()
        if (utm) return utm
    } catch {
        // ignore invalid path/url
    }

    if (!referrer) return 'Direct'

    try {
        const host = new URL(referrer).hostname.toLowerCase()
        if (/google|bing|baidu|yahoo|duckduckgo|yandex/.test(host)) return 'Search'
        if (/facebook|instagram|tiktok|linkedin|twitter|x\.com|weibo|xiaohongshu|wechat/.test(host)) return 'Social'
        return host
    } catch {
        return 'Direct'
    }
}

function normalizeCountry(raw: string | null): string {
    const value = (raw || '').trim().toUpperCase()
    if (!value || value === 'UNKNOWN' || value === 'XX' || value === 'T1') return ''
    if (/^[A-Z]{2}$/.test(value)) return value
    return ''
}

function getClientIp(headersList: Headers): string {
    const candidates = [
        headersList.get('cf-connecting-ip'),
        headersList.get('x-forwarded-for'),
        headersList.get('x-real-ip'),
        headersList.get('x-vercel-forwarded-for'),
        headersList.get('forwarded')
    ].filter(Boolean) as string[]

    for (const candidate of candidates) {
        const first = candidate
            .split(',')[0]
            .trim()
            .replace(/^for=/i, '')
            .replace(/^"|"$/g, '')
            .replace(/^\[|]$/g, '')

        if (first) return first
    }
    return 'unknown'
}

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
    const s = ua || ''

    let browser = 'Unknown'
    if (/Edg\//.test(s)) browser = 'Edge'
    else if (/OPR\/|Opera/.test(s)) browser = 'Opera'
    else if (/Chrome\//.test(s) && !/Chromium/.test(s)) browser = 'Chrome'
    else if (/Firefox\//.test(s)) browser = 'Firefox'
    else if (/Safari\//.test(s) && !/Chrome/.test(s)) browser = 'Safari'
    else if (/MSIE|Trident/.test(s)) browser = 'IE'

    let os = 'Unknown'
    if (/Windows NT/.test(s)) os = 'Windows'
    else if (/Mac OS X/.test(s) && !/iPhone|iPad/.test(s)) os = 'MacOS'
    else if (/Android/.test(s)) os = 'Android'
    else if (/iPhone|iPad/.test(s)) os = 'iOS'
    else if (/Linux/.test(s)) os = 'Linux'

    let device = 'Desktop'
    if (/Mobile|iPhone|Android.*Mobile/.test(s)) device = 'Mobile'
    else if (/iPad|Tablet|tablet/.test(s)) device = 'Tablet'

    return { browser, os, device }
}

function isPrivateOrLocalIp(ip: string): boolean {
    if (!ip || ip === 'unknown') return true
    const lowerIp = ip.toLowerCase()
    if (lowerIp === '127.0.0.1' || lowerIp === '::1' || lowerIp === 'localhost') return true
    if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd') || lowerIp.startsWith('fe80')) return true
    return false
}

export async function POST(request: Request) {
    try {
        const headersList = request.headers
        const ip = getClientIp(headersList)
        const countryHeader = normalizeCountry(
            headersList.get('cf-ipcountry') ||
            headersList.get('x-vercel-ip-country') ||
            headersList.get('x-country-code') ||
            headersList.get('x-country')
        )
        let country = countryHeader

        if (!country) {
            if (isPrivateOrLocalIp(ip)) {
                country = 'Local'
            } else if (geoip) {
                const geo = geoip.lookup(ip)
                if (geo) {
                    country = geo.country || 'Unknown'
                } else {
                    country = 'Unknown'
                }
            }
        }

        // Optional: Get body for path navigation if needed
        const body = await request.json().catch(() => ({}))
        const path = body.path || '/'
        const referrer = (body.referrer || headersList.get('referer') || '').toString()
        const source = detectSource(path, referrer, body.source)
        const userAgent = headersList.get('user-agent') || ''
        const { browser, os, device } = parseUserAgent(userAgent)

        await prisma.visitLog.create({
            data: {
                ip,
                path,
                referrer,
                source,
                country,
                browser,
                os,
                device,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to log visit:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}

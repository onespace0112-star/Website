'use client'

import { useEffect, useRef } from 'react'

export default function VisitTracker() {
    const initialized = useRef(false)

    useEffect(() => {
        // Prevent double effect call in React Strict Mode (dev)
        if (initialized.current) return
        initialized.current = true

        const recordVisit = async () => {
            try {
                const visitorKey = 'onespace_visitor_id'
                const sessionKey = 'onespace_visit_logged'

                if (typeof window === 'undefined') return
                if (window.sessionStorage?.getItem(sessionKey) === '1') return

                let visitorId = window.localStorage?.getItem(visitorKey)
                if (!visitorId) {
                    // Simple UUID fallback to avoid external deps
                    visitorId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
                    window.localStorage?.setItem(visitorKey, visitorId)
                }

                const url = new URL(window.location.href)
                const referrer = document.referrer || ''
                const utmSource = url.searchParams.get('utm_source') || ''

                // Detect source client-side (mirrors server logic in /api/visit/route.ts)
                const detectSource = (ref: string, utm: string): string => {
                    if (utm) return utm
                    if (!ref) return 'Direct'
                    try {
                        const domain = new URL(ref).hostname.toLowerCase()
                        if (['google', 'bing', 'baidu', 'yahoo', 'duckduckgo', 'yandex'].some(s => domain.includes(s))) return 'Search'
                        if (['facebook', 'instagram', 'tiktok', 'linkedin', 'twitter', 'weibo', 'wechat'].some(s => domain.includes(s))) return 'Social'
                        return domain
                    } catch { return 'Direct' }
                }
                const visitSource = detectSource(referrer, utmSource)
                window.sessionStorage?.setItem('onespace_visit_source', visitSource)

                const payload = JSON.stringify({
                    path: `${window.location.pathname}${window.location.search || ''}`,
                    referrer,
                    source: utmSource,
                    visitorId
                })

                let ok = false
                if (navigator.sendBeacon) {
                    const blob = new Blob([payload], { type: 'application/json' })
                    ok = navigator.sendBeacon('/api/visit', blob)
                }

                if (!ok) {
                    await fetch('/api/visit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                        keepalive: true
                    })
                }

                window.sessionStorage?.setItem(sessionKey, '1')
            } catch (error) {
                // Silent error
            }
        }

        // Record visit once on mount (session start / page load)
        recordVisit()

        // Optional: Could add logic to track route changes if needed,
        // but for "IP stats", one hit per session/load is often enough
        // or we rely on page reloads.
        // For SPA transitions, we might want to listen to pathname changes 
        // but that might inflate counts excessively if not debounced/processed.
        // Keeping it simple: 1 load = 1 visit record for now.
    }, [])

    // If we want to track every page view:
    /*
    useEffect(() => {
        recordVisit(pathname)
    }, [pathname])
    */

    return null
}

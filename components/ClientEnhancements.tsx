'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false })
const AOSInit = dynamic(() => import('./AOSInit'), { ssr: false })
const CanvasOverlay = dynamic(() => import('./CanvasOverlay'), { ssr: false })
const VisitTracker = dynamic(() => import('./VisitTracker'), { ssr: false })

export default function ClientEnhancements() {
    const [enhancementsReady, setEnhancementsReady] = useState(false)
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')
    const isVideosRoute = pathname?.startsWith('/videos')

    useEffect(() => {
        if (typeof window === 'undefined') return
        const html = document.documentElement
        const body = document.body
        html.style.removeProperty('overflow')
        body.style.removeProperty('overflow')
    }, [pathname])

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (window.innerWidth > 1023) return

        const html = document.documentElement
        const body = document.body
        const unlockScroll = () => {
            html.style.removeProperty('overflow')
            body.style.removeProperty('overflow')
            body.style.removeProperty('position')
            body.style.removeProperty('height')
        }

        unlockScroll()
        const timer = window.setInterval(unlockScroll, 300)

        return () => {
            window.clearInterval(timer)
            unlockScroll()
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const run = () => {
            if (!cancelled) setEnhancementsReady(true)
        }

        const idle =
            typeof window !== 'undefined' && 'requestIdleCallback' in window
                ? window.requestIdleCallback(run, { timeout: 1800 })
                : window.setTimeout(run, 1200)

        return () => {
            cancelled = true
            if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idle as number)
            } else {
                window.clearTimeout(idle as number)
            }
        }
    }, [])

    if (isAdminRoute) return null

    return (
        <>
            <VisitTracker />
            <AOSInit />
            {enhancementsReady && !isVideosRoute && (
                <CanvasOverlay />
            )}
            {enhancementsReady && <ChatWidget />}
        </>
    )
}

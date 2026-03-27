
'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface HeaderData {
    id: number
    page: string
    title: string
    description: string | null
    image: string | null
    height: number
}

interface PageBannerProps {
    page: string // "service", "process", "project", "faq", "team", "inquiry"
    fallbackTitle: string
    fallbackDesc: string
    fallbackImage?: string
    tag?: string
}

export default function PageBanner({ page, fallbackTitle, fallbackDesc, fallbackImage = "/images/services/hero.png", tag }: PageBannerProps) {
    const [header, setHeader] = useState<HeaderData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHeader = async () => {
            try {
                // Add timestamp to avoid caching
                const res = await fetch(`/api/admin/headers?page=${page}`, { next: { revalidate: 60 } })
                if (res.ok) {
                    const data = await res.json()
                    // Get the latest one
                    if (Array.isArray(data) && data.length > 0) {
                        setHeader(data[0])
                    }
                }
            } catch (err) {
                console.error('Failed to fetch header:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHeader()
    }, [page])

    const { locale } = useLanguage()

    const displayTitle = locale === 'zh' ? fallbackTitle : (header?.title || fallbackTitle)
    const displayDesc = locale === 'zh' ? fallbackDesc : (header?.description || fallbackDesc)
    const displayImage = header?.image || fallbackImage
    const displayHeight = header?.height ? `${header.height}px` : undefined

    // Base classes
    const baseClasses = "relative flex items-center justify-center overflow-hidden"
    // Mobile height is always 400px (min-height)
    const mobileClasses = "min-h-[400px]"

    // Desktop height logic
    let desktopClasses = ""
    if (displayHeight) {
        // If config height exists, use it on desktop
        desktopClasses = "md:h-[var(--header-height)]"
    } else {
        // Defaults if no config height
        desktopClasses = page === 'service' ? "md:min-h-[400px] lg:h-[85vh]" :
            page === 'process' ? "md:min-h-[400px] lg:h-[60vh]" :
                "md:min-h-[400px]"
    }

    const containerClasses = `${baseClasses} ${mobileClasses} ${desktopClasses}`

    return (
        <section className={containerClasses} style={displayHeight ? { '--header-height': displayHeight } as React.CSSProperties : undefined}>
            <div className="absolute inset-0 z-0">
                <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover scale-105 animate-slow-zoom brightness-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-12 md:pt-20">
                {tag && (
                    <div className="inline-block px-4 py-1 border border-[#c5a059]/30 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-[12px] tracking-[0.3em] uppercase mb-4 md:mb-8 animate-fade-in">
                        {tag}
                    </div>
                )}
                <h1 className="text-2xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 md:mb-8 text-white drop-shadow-2xl animate-fade-in-up max-w-4xl mx-auto">
                    {displayTitle}
                </h1>
                {displayDesc && (
                    <p className="text-xs md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up [animation-delay:200ms]">
                        {displayDesc}
                    </p>
                )}
                {page === 'process' && (
                    <div className="w-24 h-1 bg-[#c5a059] mx-auto mt-8 animate-fade-in [animation-delay:400ms]"></div>
                )}
            </div>

            <style jsx>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s linear infinite alternate;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </section>
    )
}

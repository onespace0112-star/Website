'use client'

import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface VideoHeader {
    image?: string | null
    title?: string | null
    description?: string | null
    height?: number | null
}

interface VideoType {
    id: number
    name: string
}

interface VideoItem {
    id: number
    title: string
    videoUrl: string | null
    coverImage?: string | null
    order: number
    typeId: number | null
    type?: VideoType | null
}

// 检查视频 URL 是否有效（非空且不为空字符串）
const isValidVideoUrl = (url: string | null | undefined): boolean => {
    return !!url && url.trim() !== '' && url.trim().toLowerCase() !== 'null'
}

interface VideoClientProps {
    header: VideoHeader | null
    types: VideoType[]
    videos: VideoItem[]
}

export default function VideoClient({ header, types, videos }: VideoClientProps) {
    const { locale, t } = useLanguage()
    const [posterMap, setPosterMap] = useState<Record<number, string>>({})
    const [playingIds, setPlayingIds] = useState<Set<number>>(new Set())

    const startPlay = (id: number) => setPlayingIds((prev) => new Set(prev).add(id))
    const stopPlay = (id: number) => setPlayingIds((prev) => { const s = new Set(prev); s.delete(id); return s })

    const grouped = types.map((type) => ({
        type,
        items: videos.filter((v) => v.typeId === type.id)
    }))

    const otherVideos = videos.filter((v) => !v.typeId)

    const heroImage = header?.image || '/images/services/hero.png'
    const heroTitle = header?.title || (locale === 'zh' ? '视频展示' : 'Showroom Videos')
    const heroDesc = header?.description || (locale === 'zh' ? '高端项目与展厅视频合集' : 'A curated collection of project and showroom videos.')
    const heroHeight = header?.height ? `${header.height}px` : undefined

    // 自动生成视频首帧封面
    useEffect(() => {
        const missingPosters = videos.filter((v) => v.videoUrl && !posterMap[v.id])
        if (missingPosters.length === 0) return

        missingPosters.forEach((video) => {
            try {
                const el = document.createElement('video')
                el.crossOrigin = 'anonymous'
                el.preload = 'metadata'
                el.src = video.videoUrl || ''

                const handleLoaded = () => {
                    try {
                        const w = el.videoWidth || 1280
                        const h = el.videoHeight || 720
                        const canvas = document.createElement('canvas')
                        canvas.width = w
                        canvas.height = h
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.drawImage(el, 0, 0, w, h)
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.72)
                            setPosterMap((prev) => ({ ...prev, [video.id]: dataUrl }))
                        }
                    } catch (err) {
                        console.error('生成视频封面失败', err)
                    } finally {
                        cleanup()
                    }
                }

                const handleError = () => cleanup()
                const cleanup = () => {
                    el.pause()
                    el.src = ''
                    el.load()
                    el.removeEventListener('loadeddata', handleLoaded)
                    el.removeEventListener('error', handleError)
                }

                el.addEventListener('loadeddata', handleLoaded, { once: true })
                el.addEventListener('error', handleError, { once: true })
                el.load()
            } catch (error) {
                console.error('处理视频封面时出错', error)
            }
        })
    }, [videos, posterMap])

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white">
            <SiteHeader />

            <section
                className={`relative flex items-center justify-center overflow-hidden min-h-[400px] ${heroHeight ? 'md:h-[var(--header-height)]' : 'md:min-h-[400px]'}`}
                style={heroHeight ? { '--header-height': heroHeight } as React.CSSProperties : undefined}
            >
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt={heroTitle}
                        className="w-full h-full object-cover scale-105"
                        onError={(e) => {
                            console.error('Video header image failed to load:', heroImage)
                            const target = e.target as HTMLImageElement
                            // Fallback to default image
                            target.src = '/images/services/hero.png'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-12 md:pt-20">
                    <div className="inline-block px-4 py-1 border border-[#c5a059]/30 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-[12px] tracking-[0.3em] uppercase mb-4 md:mb-8">
                        {locale === 'zh' ? '视频中心' : 'Video Center'}
                    </div>
                    <h1 className="text-2xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 md:mb-6 text-white">
                        {heroTitle}
                    </h1>
                    <p className="text-xs md:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto font-light">
                        {heroDesc}
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-16 space-y-14">
                {grouped.map(({ type, items }) => (
                    <section key={type.id} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-1.5 h-6 bg-[#c5a059] rounded-full" />
                            <h2 className="text-xl md:text-2xl font-bold">{type.name}</h2>
                        </div>
                        {items.length === 0 ? (
                            <div className="text-sm text-white/50">{locale === 'zh' ? '暂无视频' : 'No videos yet.'}</div>
                        ) : (
                            <div
                                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide"
                                style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain', touchAction: 'pan-x' }}
                            >
                                {items.map((item) => (
                                    <div key={item.id} className="w-[85vw] flex-shrink-0 snap-center sm:w-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                        {/* Mobile: 用 poster 属性显示封面图，原生点击播放 */}
                                        <div className="sm:hidden h-[500px] bg-black">
                                            {playingIds.has(item.id) && isValidVideoUrl(item.videoUrl) ? (
                                                <video
                                                    src={item.videoUrl!}
                                                    controls
                                                    playsInline
                                                    autoPlay
                                                    className="w-full h-full object-cover"
                                                    onEnded={() => stopPlay(item.id)}
                                                />
                                            ) : item.coverImage ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={item.coverImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/services/hero.png' }}
                                                    />
                                                    {isValidVideoUrl(item.videoUrl) && (
                                                        <button
                                                            onClick={() => startPlay(item.id)}
                                                            className="absolute inset-0 flex items-center justify-center"
                                                            aria-label="播放视频"
                                                        >
                                                            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border border-white/40 backdrop-blur-sm">
                                                                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : isValidVideoUrl(item.videoUrl) ? (
                                                <video
                                                    src={item.videoUrl!}
                                                    controls
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">{locale === 'zh' ? '暂无封面' : 'No cover'}</div>
                                            )}
                                        </div>

                                        {/* 桌面端仅展示视频，不展示封面图 */}
                                        <div className="hidden sm:block h-auto sm:aspect-[16/10] bg-black">
                                            {isValidVideoUrl(item.videoUrl) ? (
                                                <video
                                                    src={item.videoUrl!}
                                                    controls
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                    preload="metadata"
                                                    onError={(e) => {
                                                        console.error(`视频加载失败 (ID: ${item.id}):`, item.videoUrl)
                                                        const target = e.target as HTMLVideoElement
                                                        target.style.display = 'none'
                                                        const parent = target.parentElement
                                                        if (parent) {
                                                            const errorDiv = document.createElement('div')
                                                            errorDiv.className = 'w-full h-full flex items-center justify-center text-white/40 text-sm'
                                                            errorDiv.textContent = locale === 'zh' ? '视频加载失败' : 'Video load failed'
                                                            parent.appendChild(errorDiv)
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">{locale === 'zh' ? '暂无视频' : 'No video'}</div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ))}

                {otherVideos.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-1.5 h-6 bg-[#c5a059] rounded-full" />
                            <h2 className="text-xl md:text-2xl font-bold">{locale === 'zh' ? '其他' : 'Other'}</h2>
                        </div>
                        <div
                            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide"
                            style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain', touchAction: 'pan-x' }}
                        >
                            {otherVideos.map((item) => (
                                <div key={item.id} className="w-[85vw] flex-shrink-0 snap-center sm:w-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                    <div className="sm:hidden h-[500px] bg-black">
                                        {item.coverImage ? (
                                            <img
                                                src={item.coverImage}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/services/hero.png' }}
                                            />
                                        ) : isValidVideoUrl(item.videoUrl) ? (
                                            <video
                                                src={item.videoUrl!}
                                                controls
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">{locale === 'zh' ? '暂无封面' : 'No cover'}</div>
                                        )}
                                    </div>

                                    <div className="hidden sm:block h-auto sm:aspect-[16/10] bg-black">
                                        {isValidVideoUrl(item.videoUrl) ? (
                                            <video
                                                src={item.videoUrl!}
                                                controls
                                                playsInline
                                                className="w-full h-full object-cover"
                                                preload="metadata"
                                                onError={(e) => {
                                                    console.error(`视频加载失败 (ID: ${item.id}):`, item.videoUrl)
                                                    const target = e.target as HTMLVideoElement
                                                    target.style.display = 'none'
                                                    const parent = target.parentElement
                                                    if (parent) {
                                                        const errorDiv = document.createElement('div')
                                                        errorDiv.className = 'w-full h-full flex items-center justify-center text-white/40 text-sm'
                                                        errorDiv.textContent = locale === 'zh' ? '视频加载失败' : 'Video load failed'
                                                        parent.appendChild(errorDiv)
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">{locale === 'zh' ? '暂无视频' : 'No video'}</div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ======== CONTACT CTA ======== */}
            <section className="relative py-10 md:py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/luxury_bg.png"
                        alt={t.luxury.contactBgAlt}
                        className="w-full h-full object-cover opacity-50 luxury-image"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/80" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <h2 className="text-[20px] md:text-5xl font-serif font-bold mb-6 tracking-wide text-white uppercase leading-tight">
                        {t.luxury.faqPage.ctaTitle}
                    </h2>
                    <p className="text-gray-400 mb-10 text-base md:text-lg leading-relaxed">
                        {t.luxury.faqPage.ctaSubtitle}
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-[#c5a059] text-black px-10 py-4 rounded-[10px] text-sm md:text-base font-bold tracking-[0.2em] hover:bg-white transition-colors duration-300 uppercase"
                    >
                        {t.team.contactBtn}
                    </Link>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}

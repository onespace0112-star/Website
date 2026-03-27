'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import PageBanner from '@/components/PageBanner'

export default function CasesClient() {
    const { t, locale } = useLanguage()
    const [dbProjects, setDbProjects] = useState<any[]>([])
    const [projectsLoaded, setProjectsLoaded] = useState(false)
    const [modalUrl, setModalUrl] = useState<string>('')
    const [loadingPreview, setLoadingPreview] = useState(false)
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
    const { translate, preload } = useZhRuntimeTranslator(locale, (t as any).projectMap || {})
    const detailsPdfUrl = '/pdfs/singapore-french.pdf'

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects', { cache: 'no-store' })
                const data = await res.json()
                if (Array.isArray(data)) setDbProjects(data)
            } catch (error) {
                console.error('Failed to fetch projects:', error)
            } finally {
                setProjectsLoaded(true)
            }
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        preload(dbProjects.flatMap((p: any) => [p?.title, p?.location]))
    }, [locale, dbProjects, preload])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setModalUrl('')
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const startLoading = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        setLoadingPreview(true)
    }

    const stopLoadingSoon = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        hideTimerRef.current = setTimeout(() => setLoadingPreview(false), 600)
    }

    const closeModal = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        setModalUrl('')
        setLoadingPreview(false)
    }

    const typeMatchers = [
        { id: 'villa', title: t.luxury.casesPage.categories.villa, keywords: ['villa', '别墅'] },
        { id: 'apartment', title: t.luxury.casesPage.categories.apartment, keywords: ['apartment', '公寓', '住宅'] },
        { id: 'hotel', title: t.luxury.casesPage.categories.hotel, keywords: ['hotel', '酒店'] },
        { id: 'school', title: t.luxury.casesPage.categories.school, keywords: ['school', '学校', '教育'] }
    ]

    const normalizeUrl = (url?: string | null) => {
        if (!url) return ''
        const match = url.match(/viewer\?file=([^&]+)/)
        if (match) {
            try {
                return encodeURI(decodeURIComponent(match[1]))
            } catch {
                return encodeURI(match[1])
            }
        }
        return encodeURI(url)
    }

    const categories = typeMatchers
        .map((category) => {
            const items = dbProjects
                .filter((p) => {
                    const tName = p.type?.name?.toLowerCase() || ''
                    return category.keywords.some((kw) => tName.includes(kw))
                })
                .map((p) => ({
                    title: translate(p.title),
                    img: p.coverImage || '/images/cases/villa-1.png',
                    subtitle: [translate(p.location), p.area ? `${p.area}m²` : null].filter(Boolean).join(' | '),
                    fileUrl: p.fileUrl ? normalizeUrl(p.fileUrl) : ''
                }))
            return { id: category.id, title: category.title, items }
        })
        .filter((c) => c.items.length > 0)

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-[#c5a059]/30">
            {/* Header */}
            <SiteHeader />

            {/* Hero Section */}
            <PageBanner
                page="project"
                fallbackTitle={t.luxury.casesPage.heroTitle}
                fallbackDesc={t.luxury.casesPage.heroSubtitle}
                fallbackImage="/images/cases/hero.png"
            />

            {/* Cases Grid */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-10 md:py-20 bg-[#F5F5F7]">
                <div className="bg-white p-4 sm:p-8 md:p-12 shadow-xl rounded-sm">
                    {categories.map((category) => (
                        <section key={category.id} className="mb-16 last:mb-0" data-aos="fade-up">
                            <div className="flex justify-between items-end mb-4 sm:mb-8 border-b border-gray-100 pb-3 sm:pb-4">
                                <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#333] pl-3 sm:pl-4 border-l-4 border-[#c5a059]" data-aos="fade-right">
                                    {category.title}
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="group" data-aos="fade-up" data-aos-delay={idx * 100}>
                                        <button
                                            onClick={() => {
                                                startLoading()
                                                setModalUrl(item.fileUrl || detailsPdfUrl)
                                            }}
                                            className="block relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-sm mb-3 w-full text-left focus:outline-none"
                                            aria-label={item.title}
                                        >
                                            <img
                                                src={item.img}
                                                loading="lazy"
                                                decoding="async"
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
                                        </button>
                                        <div className="px-0.5 sm:px-1">
                                            <h3 className="font-bold text-sm sm:text-lg text-gray-900 group-hover:text-[#c5a059] transition-colors leading-tight">{item.title}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">{item.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    {projectsLoaded && categories.length === 0 && (
                        <div className="py-14 text-center text-gray-500">
                            {locale === 'zh' ? '暂无项目案例' : 'No project cases available.'}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <section className="relative h-[400px] overflow-hidden" data-aos="fade-in">
                <div className="absolute inset-0">
                    <img src="/images/cases/hero.png" className="w-full h-full object-cover blur-sm brightness-50" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/10 to-blue-900/40"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white z-10">
                    <h2 className="text-[20px] md:text-[48px] font-serif font-bold mb-6 max-w-4xl leading-tight" data-aos="zoom-in">
                        {t.luxury.casesPage.cta.line1}
                    </h2>
                    <p className="text-base text-gray-200 mb-10 max-w-3xl font-light leading-relaxed" data-aos="fade-up" data-aos-delay="200">
                        {t.luxury.casesPage.cta.line2}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4" data-aos="fade-up" data-aos-delay="300">
                        <Link
                            href="/contact"
                            className="px-10 py-4 bg-white text-blue-900 font-bold uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg rounded-[10px]"
                        >
                            {t.team.contactBtn}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Site Footer */}
            <SiteFooter />

            {/* File Preview Modal */}
            {modalUrl && (
                <div
                    className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-1 sm:p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-[#111] w-full max-w-5xl h-[80vh] sm:h-[85vh] rounded-sm shadow-2xl overflow-hidden relative mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 text-white bg-black/40 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center text-xl z-10"
                            onClick={closeModal}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        {loadingPreview && (
                            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-black/40">
                                <div className="absolute left-0 top-0 h-full w-1/3 bg-[#c5a059] animate-progressbar" />
                            </div>
                        )}
                        <iframe
                            key={modalUrl}
                            src={`${modalUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full border-0"
                            allow="autoplay; fullscreen; clipboard-write"
                            title="项目文件预览"
                            onLoad={stopLoadingSoon}
                        />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slow-pan {
                    0% { object-position: 50% 0%; transform: scale(1); }
                    100% { object-position: 50% 100%; transform: scale(1.1); }
                }
                .animate-slow-pan {
                    animation: slow-pan 30s linear infinite alternate;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 1s ease forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes progressbar {
                    0% { transform: translateX(-140%); }
                    100% { transform: translateX(420%); }
                }
                .animate-progressbar {
                    animation: progressbar 1.4s ease-in-out infinite;
                }
                .site-logo {
                    font-size: 36px !important;
                    line-height: 1;
                }
            `}</style>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'
import LanguageSwitcher from './LanguageSwitcher'
import {
    Sofa,
    Palette,
    Home,
    Trees,
    Globe,
    Ship,
    Wrench,
    CheckCircle2,
    Clock,
    Search,
    MessageSquare,
    ChevronRight,
    ArrowRight
} from 'lucide-react'

import { useQuoteModal } from '@/lib/QuoteModalContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter' // Added this line

import PageBanner from '@/components/PageBanner'

export default function ServiceClient() {
    const { t, locale } = useLanguage()
    const { openQuoteModal } = useQuoteModal()
    const [serviceTypes, setServiceTypes] = useState<any[]>([])
    const [qaItems, setQaItems] = useState<any[]>([])
    const { translate, preload } = useZhRuntimeTranslator(locale, (t as any).projectMap || {})

    const getServiceKey = (name: string) => {
        const n = (name || '').toLowerCase()
        if (n.includes('soft')) return 'softFurnishing'
        if (n.includes('interior')) return 'interior'
        if (n.includes('architectural')) return 'architectural'
        if (n.includes('landscape')) return 'landscape'
        if (n.includes('procurement') || n.includes('global')) return 'procurement'
        if (n.includes('logistics')) return 'logistics'
        if (n.includes('installation')) return 'installation'
        return null
    }

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services')
                const data = await res.json()
                if (Array.isArray(data)) {
                    const mappedServices = data.map((item: any) => {
                        const rawTitle = item.type?.name || 'Service'
                        const serviceKey = getServiceKey(rawTitle)
                        let title = rawTitle
                        let label = item.description || ''

                        if (serviceKey) {
                            // @ts-expect-error service key is derived dynamically from CMS data
                            title = t.luxury.serviceTypePage.serviceTypes.items[serviceKey] || rawTitle
                            if (locale === 'zh') {
                                // @ts-expect-error service key is derived dynamically from CMS data
                                label = t.luxury.serviceTypePage.serviceTypes.descriptions[serviceKey] || label
                            }
                        }

                        return {
                            id: item.id,
                            title,
                            label,
                            img: item.image || '/images/interior_european_wooden.png',
                            iconUrl: item.icon,
                            icon: <Home className="w-8 h-8" />
                        }
                    })
                    setServiceTypes(mappedServices)
                }
            } catch (error) {
                console.error('Failed to fetch services:', error)
            }
        }

        const fetchQA = async () => {
            try {
                const res = await fetch('/api/services/qa')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setQaItems(data.map((item: any) => ({
                        id: item.id,
                        title:
                            locale === 'zh' && item.title?.toLowerCase().includes('quick')
                                ? t.luxury.serviceTypePage.guarantee.quickResponse.title
                                : locale === 'zh' && item.title?.toLowerCase().includes('trace')
                                    ? t.luxury.serviceTypePage.guarantee.traceability.title
                                    : locale === 'zh' && item.title?.toLowerCase().includes('continuous')
                                        ? t.luxury.serviceTypePage.guarantee.optimization.title
                                        : item.title,
                        desc:
                            locale === 'zh' && item.title?.toLowerCase().includes('quick')
                                ? t.luxury.serviceTypePage.guarantee.quickResponse.desc
                                : locale === 'zh' && item.title?.toLowerCase().includes('trace')
                                    ? t.luxury.serviceTypePage.guarantee.traceability.desc
                                    : locale === 'zh' && item.title?.toLowerCase().includes('continuous')
                                        ? t.luxury.serviceTypePage.guarantee.optimization.desc
                                        : item.description,
                        img: item.image || '/images/services/guarantee-1.png',
                        icon: <CheckCircle2 className="w-6 h-6 text-[#c5a059]" />
                    })))
                }
            } catch (error) {
                console.error('Failed to fetch QA:', error)
            }
        }

        fetchServices()
        fetchQA()
    }, [locale, t])

    useEffect(() => {
        preload([
            ...serviceTypes.flatMap((s) => [s?.title, s?.label]),
            ...qaItems.flatMap((q) => [q?.title, q?.desc]),
        ])
    }, [locale, serviceTypes, qaItems, preload])

    const guarantees = [
        {
            title: t.luxury.serviceTypePage.guarantee.quickResponse.title,
            desc: t.luxury.serviceTypePage.guarantee.quickResponse.desc,
            img: '/images/services/guarantee-1.png',
            icon: <Clock className="w-6 h-6 text-[#c5a059]" />
        },
        {
            title: t.luxury.serviceTypePage.guarantee.traceability.title,
            desc: t.luxury.serviceTypePage.guarantee.traceability.desc,
            img: '/images/services/guarantee-2.png',
            icon: <Search className="w-6 h-6 text-[#c5a059]" />
        },
        {
            title: t.luxury.serviceTypePage.guarantee.optimization.title,
            desc: t.luxury.serviceTypePage.guarantee.optimization.desc,
            img: '/images/services/guarantee-3.png',
            icon: <CheckCircle2 className="w-6 h-6 text-[#c5a059]" />
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c5a059]/30">
            {/* Header */}
            {/* Header */}
            <SiteHeader />

            {/* Hero Section */}
            <PageBanner
                page="service"
                fallbackTitle={t.luxury.serviceTypePage.hero.title}
                fallbackDesc={t.luxury.serviceTypePage.hero.desc}
                fallbackImage="/images/services/hero.png"
                tag={locale === 'zh' ? '一站式服务' : 'ONE-STOP SERVICE'}
            />

            {/* Service Types Grid */}
            <section className="relative py-16 md:py-32 px-6 bg-[#0a0a0a] overflow-hidden">
                {/* Tech Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img src="/images/services/tech-bg.png" className="w-full h-full object-cover" alt="" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center mb-20" data-aos="fade-up">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-4">
                            {t.luxury.serviceTypePage.serviceTypes.title.split(' ').map((word: string, i: number) =>
                                i === 0 ? <span key={i}>{word} </span> : <span key={i} className="text-[#c5a059]">{word} </span>
                            )}
                        </h2>
                        <div className="w-24 h-1 bg-[#c5a059] rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {serviceTypes.map((service, index) => (
                            <div
                                key={service.id}
                                className={`group relative p-8 bg-black border border-white/10 hover:border-[#c5a059]/50 transition-all duration-700 overflow-hidden h-72 flex flex-col justify-between rounded-[10px] ${index === 0 ? 'lg:col-span-1' : ''}`}
                                data-aos="fade-up" data-aos-delay={index * 100}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={service.img}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.9]"
                                    />
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500"></div>
                                </div>

                                {/* Glow Effect */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c5a059]/30 rounded-full blur-3xl group-hover:bg-[#c5a059]/40 transition-all duration-700 z-0"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-transparent border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden">
                                        {service.iconUrl ? (
                                            <img src={service.iconUrl} alt="Icon" className="w-10 h-10 object-contain" />
                                        ) : (
                                            service.icon
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-[#c5a059] transition-colors">{translate(service.title)}</h3>
                                    <p className="text-xs tracking-widest text-gray-200 uppercase">{translate(service.label)}</p>
                                </div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="w-0 h-[1px] bg-[#c5a059] group-hover:w-16 transition-all duration-700"></div>
                                    <ArrowRight className="w-5 h-5 text-[#c5a059] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                                </div>

                                {/* Animated Background Pattern */}
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                            </div>
                        ))}

                        {/* Summary / Tech Card */}
                        <div className="hidden lg:flex flex-col justify-center p-8 bg-[#c5a059] text-black h-72 group rounded-[10px]" data-aos="zoom-in" data-aos-delay="400">
                            <h3 className="text-3xl font-serif font-bold mb-4">{t.luxury.serviceTypePage.summaryCard.title}</h3>
                            <p className="text-sm opacity-80 leading-relaxed mb-6">{t.luxury.serviceTypePage.summaryCard.desc}</p>
                            <Link href="/contact" className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest hover:translate-x-2 transition-transform">
                                {t.luxury.serviceTypePage.summaryCard.cta} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Guarantee Section */}
            <section className="py-32 px-6 bg-white text-[#1a1a1a]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-20 text-center" data-aos="fade-up">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                            {t.luxury.serviceTypePage.guarantee.title.split(' ').map((word: string, i: number) =>
                                i === 0 ? <span key={i}>{word} </span> : <span key={i} className="text-[#c5a059]">{word} </span>
                            )}
                        </h2>
                        <div className="w-24 h-1 bg-[#c5a059] rounded-full mb-6"></div>
                        <p className="text-gray-500 max-w-2xl font-light">{t.luxury.serviceTypePage.guarantee.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {qaItems.map((item, index) => (
                            <div key={item.id} className="group" data-aos="fade-up" data-aos-delay={index * 150}>
                                <div className="relative h-64 mb-8 overflow-hidden rounded-[10px] shadow-2xl">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
                                    <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg transform group-hover:rotate-[360deg] transition-transform duration-700">
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-[#c5a059] transition-colors">{translate(item.title)}</h3>
                                <div className="w-12 h-[2px] bg-[#c5a059] mb-6 group-hover:w-full transition-all duration-700"></div>
                                <p className="text-gray-600 leading-relaxed font-light">{translate(item.desc)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-10 md:py-32 px-6 overflow-hidden bg-[#0a0a0a]" data-aos="fade-in">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <h2 className="text-[20px] md:text-[48px] font-serif font-bold mb-8 leading-tight" data-aos="zoom-in">
                        {t.luxury.faqPage.ctaTitle}
                    </h2>
                    <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto font-light" data-aos="fade-up" data-aos-delay="200">
                        {t.luxury.faqPage.ctaSubtitle}
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6" data-aos="fade-up" data-aos-delay="300">
                        <Link
                            href="/contact"
                            className="w-full md:w-auto px-12 py-5 bg-[#c5a059] text-black font-bold uppercase tracking-widest hover:bg-[#d4b375] hover:scale-105 transition-all duration-500 shadow-xl shadow-[#c5a059]/20 rounded-[10px] text-center"
                        >
                            {t.luxury.contactTitle}
                        </Link>
                    </div>
                </div>
            </section >

            {/* Site Footer - Matching HomeClient */}
            < SiteFooter />

            {/* Get Quote Modal */}
            {/* Get Quote Modal - Handled Globally */}

            <style jsx global>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s linear infinite alternate;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div >
    )
}

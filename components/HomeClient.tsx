'use client'

import Link from 'next/link'
import React from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { faqData, homepageFAQIds } from '@/lib/faqData'
import { Trophy, Globe2, Users, PenTool, Armchair, Building2 } from 'lucide-react'
import DoubleRowCarousel from './DoubleRowCarousel'
import ServiceSystemSection from './ServiceSystemSection'

interface Project {
    id: number
    title: string
    slug: string
    description: string
    coverImage: string | null
}

interface FAQ {
    id: number
    question: string
    answer: string
}

interface TeamMember {
    id: number
    name: string
    position: string
    image: string | null
    serviceMotion: string | null
    pastCases: string | null
}

interface HomeClientProps {
    projects: Project[]
    team: TeamMember[]
    homeOnespace: any[]
    homeGlobalCollect: any[]
    homeGallery: any[]
    homeAdvantages: any[]
    homeAfterSales: any[]
    homeCases: any[]
    carouselItems: any[]
}

export default function HomeClient({ projects, team, homeOnespace, homeGlobalCollect, homeGallery, homeAdvantages, homeAfterSales, homeCases, carouselItems }: HomeClientProps) {
    const { t, locale } = useLanguage()
    const { translate, preload } = useZhRuntimeTranslator(locale, (t as any).projectMap || {})
    const heroRef = React.useRef<HTMLElement | null>(null)
    const ctaRef = React.useRef<HTMLDivElement | null>(null)
    const clickTimerRef = React.useRef<number | null>(null)
    const idleTimerRef = React.useRef<number | null>(null)

    // Normalize incoming props to avoid undefined length errors
    const safeOnespace = Array.isArray(homeOnespace) ? homeOnespace : []
    const safeGlobalCollect = Array.isArray(homeGlobalCollect) ? homeGlobalCollect : []
    const safeGallery = Array.isArray(homeGallery) ? homeGallery : []
    const safeAdvantages = Array.isArray(homeAdvantages) ? homeAdvantages : []
    const safeAfterSales = Array.isArray(homeAfterSales) ? homeAfterSales : []
    const safeCases = Array.isArray(homeCases) ? homeCases : []
    const safeCarousel = Array.isArray(carouselItems) ? carouselItems : []

    // Data sources with fallback
    const globalCollectItems = safeGlobalCollect.length > 0 ? safeGlobalCollect : t.luxury.whyItems
    const advantageItems = safeAdvantages.length > 0 ? safeAdvantages : t.luxury.advantagesItems;
    const afterSalesItems = safeAfterSales.length > 0 ? safeAfterSales : t.luxury.afterSalesItems;
    const caseItems = safeCases.length > 0 ? safeCases.slice(0, 2) : t.luxury.cases.slice(0, 2);

    const [currentHeroIndex, setCurrentHeroIndex] = React.useState(0);
    const normalizeImage = (img?: string | null) => img ? encodeURI(img) : ''
    const heroImages = safeCarousel.length > 0
        ? safeCarousel.map(item => normalizeImage(item.image))
        : [
            "/images/hero_luxury_house.png",
            "/images/interior_european_wooden.png",
            "/images/interior_taiwan_modern.png"
        ].map(normalizeImage)
    const galleryItems = safeGallery.length > 0
        ? safeGallery.map((item: any) => ({ image: normalizeImage(item.image), title: item.title, description: item.description }))
        : heroImages.map((image) => ({ image: normalizeImage(image), title: t.luxury.heroAlt, description: '' }))
    const flowStepsSource = safeOnespace.length > 0 ? safeOnespace : (t.luxury.processPage?.steps || [])
    const flowSteps = flowStepsSource.slice(0, 3).map((step: any) => ({
        ...step,
        image: normalizeImage(step.image)
    }))
    const normalizedCollectItems = globalCollectItems.map((item: any) => ({
        ...item,
        image: normalizeImage(item.image),
        icon: normalizeImage(item.icon)
    }))
    const normalizedCaseItems = caseItems.map((item: any) => ({
        ...item,
        image: normalizeImage(item.image)
    }))
    const normalizedAdvantages = advantageItems.map((item: any) => ({
        ...item,
        image: normalizeImage(item.image),
        icon: normalizeImage(item.icon)
    }))
    const normalizedAfterSales = afterSalesItems.map((item: any) => ({
        ...item,
        image: normalizeImage(item.image)
    }))

    const [hoverSide, setHoverSide] = React.useState<'left' | 'right' | null>(null)
    const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 })
    const [clickSide, setClickSide] = React.useState<'left' | 'right' | null>(null)
    const [isIdle, setIsIdle] = React.useState(false)
    const [suppressArrows, setSuppressArrows] = React.useState(false)

    const processHeroTitle = translate(t.luxury.processPage?.hero?.title || 'One-stop delivery process')
    const processHeroDesc = translate(t.luxury.processPage?.hero?.desc || '')

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current)
            }
            if (idleTimerRef.current) {
                window.clearTimeout(idleTimerRef.current)
            }
        }
    }, [])

    const handleHeroMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (!heroRef.current) return
        const rect = heroRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        setCursorPos({ x, y })
        const ctaEl = ctaRef.current
        const isOverCTA = Boolean(ctaEl) &&
            event.clientX >= (ctaEl as HTMLDivElement).getBoundingClientRect().left &&
            event.clientX <= (ctaEl as HTMLDivElement).getBoundingClientRect().right &&
            event.clientY >= (ctaEl as HTMLDivElement).getBoundingClientRect().top &&
            event.clientY <= (ctaEl as HTMLDivElement).getBoundingClientRect().bottom
        if (isOverCTA) {
            setSuppressArrows(true)
            setHoverSide(null)
        } else {
            setSuppressArrows(false)
            setHoverSide(x < rect.width / 2 ? 'left' : 'right')
        }
        setIsIdle(false)
        if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current)
        }
        idleTimerRef.current = window.setTimeout(() => {
            setIsIdle(true)
        }, 320)
    }

    const handleHeroMouseLeave = () => {
        setHoverSide(null)
        setIsIdle(false)
        setSuppressArrows(false)
    }

    const goPrev = () => {
        setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    }

    const goNext = () => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }

    const triggerClick = (side: 'left' | 'right') => {
        setClickSide(side)
        if (clickTimerRef.current) {
            window.clearTimeout(clickTimerRef.current)
        }
        clickTimerRef.current = window.setTimeout(() => {
            setClickSide(null)
        }, 220)
    }

    React.useEffect(() => {
        const texts: string[] = []
        const collect = (item: any) => {
            if (!item) return
            if (typeof item === 'string') texts.push(item)
            if (typeof item === 'object') {
                if (item.title) texts.push(item.title)
                if (item.description) texts.push(item.description)
                if (item.desc) texts.push(item.desc)
            }
        }
        normalizedCollectItems.forEach(collect)
        galleryItems.forEach(collect)
        normalizedAdvantages.forEach(collect)
        normalizedAfterSales.forEach(collect)
        normalizedCaseItems.forEach(collect)
        flowSteps.forEach(collect)
        collect(t.luxury.processPage?.hero?.title)
        collect(t.luxury.processPage?.hero?.desc)
        collect('Global')
        collect('Gallery')
        preload(texts, { force: true })
    }, [locale, preload, normalizedCollectItems, galleryItems, normalizedAdvantages, normalizedAfterSales, normalizedCaseItems, flowSteps])

    return (
        <div className="min-h-screen text-white font-sans relative hide-why-choose">
            <div className="luxury-texture" />

            {/* ======== HEADER ======== */}
            <SiteHeader />

            {/* ======== HERO CAROUSEL ======== */}
            <section
                ref={heroRef}
                className={`relative h-[400px] lg:h-screen flex flex-col justify-center items-center text-center overflow-hidden hero-carousel ${suppressArrows ? 'cta-hover' : ''}`}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
            >
                {/* Carousel Backgrounds */}
                {heroImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={img}
                            alt={`${t.luxury.heroAlt} ${index + 1}`}
                            className="w-full h-full object-cover hero-image"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                        />
                        <div className="hero-mask" />
                    </div>
                ))}

                <div className="relative z-10 max-w-5xl px-6 hero-content pt-16 md:pt-20">
                    <h1 className="text-[24px] lg:text-[clamp(40px,8vw,90px)] font-serif font-bold leading-tight mb-4 animate-fade-in-up">
                        {t.luxury.heroTitle.split('|')[0]}<br />
                        <span className="text-gold-gradient">{t.luxury.heroTitle.split('|')[1]}</span>
                    </h1>

                    <div className="flex items-center justify-center gap-6 mt-6 md:mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="h-px w-12 bg-gold-gradient opacity-50" />
                        <p className="text-[16px] md:text-xl uppercase tracking-[0.3em] font-light text-gray-300">
                            {t.luxury.heroSubtitle}
                        </p>
                        <div className="h-px w-12 bg-gold-gradient opacity-50" />
                    </div>

                    <div
                        ref={ctaRef}
                        className="hero-cta mt-2 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
                        style={{ animationDelay: '0.55s' }}
                        onMouseEnter={() => {
                            setSuppressArrows(true)
                            setHoverSide(null)
                        }}
                        onMouseLeave={() => setSuppressArrows(false)}
                    >
                        <a
                            href="/videos"
                            onMouseEnter={() => {
                                setSuppressArrows(true)
                                setHoverSide(null)
                            }}
                            onMouseLeave={() => setSuppressArrows(false)}
                            className="btn-gold btn-gold-solid text-sm md:text-base px-8 py-3"
                        >
                            {t.footer.showroomVideo}
                        </a>
                    </div>
                </div>

                {hoverSide === 'left' && !suppressArrows && (
                    <button
                        type="button"
                        className={`hero-arrow hero-arrow--left ${hoverSide ? 'is-visible' : ''} ${clickSide === 'left' ? 'is-clicked' : ''} ${isIdle ? 'is-idle' : ''}`}
                        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
                        aria-label="Previous slide"
                        onClick={() => {
                            triggerClick('left')
                            goPrev()
                        }}
                    >
                        ←
                    </button>
                )}
                {hoverSide === 'right' && !suppressArrows && (
                    <button
                        type="button"
                        className={`hero-arrow hero-arrow--right ${hoverSide ? 'is-visible' : ''} ${clickSide === 'right' ? 'is-clicked' : ''} ${isIdle ? 'is-idle' : ''}`}
                        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
                        aria-label="Next slide"
                        onClick={() => {
                            triggerClick('right')
                            goNext()
                        }}
                    >
                        →
                    </button>
                )}

                {/* Carousel Indicators */}
                <div className="absolute bottom-12 lg:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentHeroIndex(index)}
                            className={`w-3 h-3 rounded-full border border-white/50 transition-all duration-300 ${index === currentHeroIndex ? 'bg-white scale-125' : 'bg-transparent hover:bg-white/30'
                                }`}
                            aria-label={`${t.luxury.goToSlide} ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-50 hidden lg:block">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#c5a059] to-transparent animate-pulse" />
                </div>
            </section>

            <div className="section-divider section-divider--hero" />

            {/* ======== DELIVERY FLOW + TRUST ======== */}
            <section className="py-7 md:py-14 px-6 relative overflow-hidden" data-aos="fade-up">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-xs tracking-[0.4em] uppercase text-gray-400">Delivery Flow</p>
                        <h2 className="text-3xl md:text-4xl font-serif mt-3">
                            {processHeroTitle}
                        </h2>
                        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                            {processHeroDesc || '用里程碑把复杂交付拆成可确认、可追踪的节点。'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {flowSteps.map((step: any, index: number) => (
                            <div
                                key={`${step.title}-${index}`}
                                className="luxury-card process-card p-6 md:p-8 relative overflow-hidden group"
                                data-aos="fade-up"
                                data-aos-delay={index * 120}
                            >
                                {step.image && (
                                    <div className="absolute inset-0 z-0 process-card__media">
                                        <img
                                            src={step.image}
                                            alt={translate(step.title)}
                                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 luxury-image"
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                console.error('Process card image failed to load:', step.image)
                                                const target = e.target as HTMLImageElement
                                                target.style.display = 'none'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 process-card__overlay" />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-[#c5a059] to-transparent opacity-10 rounded-full -mr-10 -mt-10" />
                                <div className="relative z-10 text-xs uppercase tracking-[0.3em] text-[#c5a059] process-card__step">
                                    Step {index + 1}
                                </div>
                                <h3 className="relative z-10 text-xl font-serif font-bold mt-3 mb-3 process-card__title">
                                    {translate(step.title)}
                                </h3>
                                <p className="relative z-10 text-gray-200 text-sm leading-relaxed process-card__desc">
                                    {translate(step.description || step.desc)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-6 px-6 relative" data-aos="fade-up">
                <div className="max-w-7xl mx-auto">
                    <div className="section-title-wrap">
                        <h2 className="text-3xl md:text-4xl font-serif text-center uppercase tracking-wider">
                            {translate('Global')} <span className="text-gold-gradient">{translate('Gallery')}</span>
                        </h2>
                    </div>
                    <div className="global-gallery-marquee">
                        <div className="global-gallery-row">
                            <div className="global-gallery-track">
                                {galleryItems.concat(galleryItems).map((item: any, index: number) => (
                                    <div key={`row-1-${item.title}-${index}`} className="global-gallery-item">
                                        <img
                                            src={item.image}
                                            alt={item.title || 'Gallery'}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="global-gallery-item__overlay" />
                                        <div className="global-gallery-item__content">
                                            <h4 className="global-gallery-item__title">
                                                {translate(item.title)}
                                            </h4>
                                            {item.description && (
                                                <p className="global-gallery-item__desc">
                                                    {translate(item.description)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="global-gallery-row">
                            <div className="global-gallery-track global-gallery-track--reverse">
                                {galleryItems.concat(galleryItems).map((item: any, index: number) => (
                                    <div key={`row-2-${item.title}-${index}`} className="global-gallery-item">
                                        <img
                                            src={item.image}
                                            alt={item.title || 'Gallery'}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="global-gallery-item__overlay" />
                                        <div className="global-gallery-item__content">
                                            <h4 className="global-gallery-item__title">
                                                {translate(item.title)}
                                            </h4>
                                            {item.description && (
                                                <p className="global-gallery-item__desc">
                                                    {translate(item.description)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE section hidden per request */}
            {/* ======== OUR ADVANTAGES ======== */}
            <section id="services" className="py-8 md:py-16 px-6" data-aos="fade-up">
                <div className="max-w-7xl mx-auto">
                    <div className="section-title-wrap mb-10">
                        <h2 className="text-3xl md:text-[48px] font-serif text-center uppercase tracking-wider px-4" data-aos="fade-in">
                            {t.luxury.advantagesTitle.split(' ')[0]} <span className="text-gold">{t.luxury.advantagesTitle.split(' ')[1]}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {normalizedAdvantages.map((item: any, i: number) => {
                            const icons = [Trophy, Globe2, Users, PenTool, Armchair, Building2];
                            const Icon = icons[i] || Trophy;

                            const isString = typeof item === 'string';
                            const title = isString ? item : item.title;
                            // Use fallback logic for image/icon if item is object (dynamic) or use defaults
                            const bgImage = (!isString && item.image) ? item.image : `/images/adv_${(i % 6) + 1}.png`;

                            // For icons, if it's dynamic data, we might have an icon URL in item.icon. 
                            // If item.icon exists, we display it as IMG. If not, use Font Icon.
                            const hasDynamicIcon = !isString && item.icon;

                            return (
                                <div key={i} className="group process-card relative p-6 md:p-10 border border-[#c5a059]/20 bg-[#141414] overflow-hidden flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                                    {/* Background Image with Overlay */}
                                    <div className="process-card__media absolute inset-0 z-0">
                                        <img
                                            src={bgImage}
                                            alt=""
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-[1200ms] luxury-image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-all duration-500" />
                                    </div>

                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#c5a059]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    {/* Icon */}
                                    <div className="relative z-10 w-20 h-20 mb-8 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#c5a059] group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] border border-white/10 group-hover:border-transparent">
                                        {hasDynamicIcon ? (
                                            <img
                                                src={item.icon}
                                                alt="Icon"
                                                className="w-9 h-9 object-contain filter-gold-to-white transition-all duration-500"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <Icon
                                                className="w-9 h-9 text-[#c5a059] group-hover:text-white transition-colors duration-500"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <h3 className="process-card__title relative z-10 text-white text-xl font-medium leading-relaxed tracking-wide group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 drop-shadow-md">
                                        {translate(title)}
                                    </h3>
                                    {!isString && item.description && (
                                        <p className="process-card__desc relative z-10 text-gray-200 text-sm mt-3 transition-all duration-300 group-hover:text-white group-hover:text-base group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                            {translate(item.description)}
                                        </p>
                                    )}

                                    {/* Decorative Corner Line */}
                                    <div className="absolute bottom-6 right-6 w-12 h-[1px] bg-[#c5a059]/30 z-10 group-hover:w-20 group-hover:bg-[#c5a059] transition-all duration-500" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>




            {/* ======== AFTER-SALES SERVICE ======== */}
            <section className="py-16 px-6" data-aos="fade-up">
                <div className="max-w-7xl mx-auto">
                    <div className="section-title-wrap mb-10 flex items-center justify-center gap-10">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <h2 className="text-4xl md:text-5xl font-serif text-center uppercase tracking-wider px-4" data-aos="zoom-in">
                            {t.luxury.afterSalesTitle.split(' ')[0]} <span className="text-[#c5a059]">{t.luxury.afterSalesTitle.split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {normalizedAfterSales.map((item: any, i: number) => {
                            const bgImage = (item.image && item.image !== '') ? item.image : `/images/after_sales_${(i % 3) + 1}.png`;

                            return (
                                <div key={i} className="item-card bg-[#141414]" data-aos="fade-up" data-aos-delay={i * 100}>
                                    <div className="item-card__media aspect-[16/9] overflow-hidden">
                                        <img
                                            src={bgImage}
                                            alt={translate(item.title)}
                                            className="w-full h-full object-cover luxury-image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="item-card__title text-2xl font-serif mb-4 text-white">
                                            {translate(item.title)}
                                        </h3>
                                        <p className="item-card__desc text-gray-400 leading-relaxed text-sm">
                                            {translate(item.description || item.desc)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>






            {/* ======== COMPLETED CASES ======== */}
            <section id="projects" className="py-16 px-6" data-aos="fade-up">
                <div className="max-w-7xl mx-auto">
                    <div className="section-title-wrap mb-10">
                        <h2 className="text-4xl md:text-5xl font-serif text-center px-4 uppercase tracking-wider" data-aos="fade-in">
                            {t.luxury.casesTitle.split(' ')[0]} <span className="text-gold-gradient">{t.luxury.casesTitle.split(' ')[1]}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {normalizedCaseItems.map((caseItem: any, i: number) => {
                            const bgImage = (caseItem.image && caseItem.image !== '')
                                ? caseItem.image
                                : (i === 0 ? "/images/interior_taiwan_modern.png" : "/images/interior_european_wooden.png");

                            return (
                                <div key={i} className="item-card bg-[#141414]" data-aos="fade-up" data-aos-delay={i * 100}>
                                    <div className="item-card__media aspect-[16/10] overflow-hidden">
                                        <img
                                            src={bgImage}
                                            alt={translate(caseItem.title)}
                                            className="w-full h-full object-cover luxury-image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="item-card__title text-2xl font-serif mb-2 text-white">
                                            {translate(caseItem.title)}
                                        </h3>
                                        <p className="item-card__desc text-gray-400 leading-relaxed text-sm max-w-xl">
                                            {translate(caseItem.description || caseItem.desc)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ======== ONESPACE SERVICE SYSTEM ======== */}
            <ServiceSystemSection locale={locale} />

            {/* ======== CONTACT CTA ======== */}
            <section className="relative py-10 md:py-24 px-6 overflow-hidden" data-aos="fade-in">
                {/* Background Image */}
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
                    <h2 className="text-[20px] md:text-5xl font-serif font-bold mb-6 tracking-wide text-white uppercase leading-tight" data-aos="zoom-in">
                        {t.luxury.faqPage.ctaTitle}
                    </h2>
                    <p className="text-gray-400 mb-10 text-base md:text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="200">
                        {t.luxury.faqPage.ctaSubtitle}
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-[#c5a059] text-black px-10 py-4 rounded-[10px] text-sm md:text-base font-bold tracking-[0.2em] hover:bg-white transition-colors duration-300 uppercase"
                        data-aos="fade-up" data-aos-delay="400"
                    >
                        {t.team.contactBtn}
                    </Link>
                </div>
            </section>

            {/* ======== FOOTER & CONTACT ======== */}
            <SiteFooter />


        </div>
    )
}

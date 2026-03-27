'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { useQuoteModal } from '@/lib/QuoteModalContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import PageBanner from './PageBanner'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'

interface FAQ {
    id: number
    question: string
    answer: string
    category: string | null
    language?: string | null
}

interface FAQClientProps {
    faqs: FAQ[]
}

export default function FAQClient({ faqs }: FAQClientProps) {
    const { t, locale } = useLanguage()
    const { openQuoteModal } = useQuoteModal()
    const [openId, setOpenId] = useState<string | number | null>(null)
    const { translate, preload } = useZhRuntimeTranslator(locale, {})
    const [search, setSearch] = useState('')
    // Grouping logic
    const categories = useMemo(() => ([
        { id: 'general', title: t.luxury.faqPage.categories.general },
        { id: 'products', title: t.luxury.faqPage.categories.products },
        { id: 'services', title: t.luxury.faqPage.categories.services },
        { id: 'shipping', title: t.luxury.faqPage.categories.shipping },
        { id: 'afterSales', title: t.luxury.faqPage.categories.afterSales },
    ]), [t])
    const [openCategories, setOpenCategories] = useState<string[]>([])
    const [searchPulse, setSearchPulse] = useState(0)
    const [searchResult, setSearchResult] = useState<{ question: string; answer: string } | null>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (searchPulse === 0) return
        const keyword = search.trim()
        if (!keyword) {
            const first = categories.find((cat) => getFaqsByCategory(cat.id).length > 0)
            if (first) setOpenCategories([first.id])
            return
        }
        const matched = categories
            .filter((cat) => getFaqsByCategory(cat.id).length > 0)
            .map((cat) => cat.id)
        if (matched.length > 0) {
            setOpenCategories(matched)
            const firstCat = matched[0]
            const firstFaqs = getFaqsByCategory(firstCat)
            const firstFaq = firstFaqs[0]
            if (firstFaq) {
                const firstKey = firstFaq.id ?? `${firstCat}-0`
                setOpenId(firstKey)
                requestAnimationFrame(() => {
                    const el = document.getElementById(`faq-item-${firstKey}`)
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                })
            }
        }
    }, [searchPulse, search, categories])

    const hasLocaleFaqs = faqs.some((f) => f.language === locale)
    const getVisibleFaqs = () => (hasLocaleFaqs ? faqs.filter((f) => (f.language ? f.language === locale : true)) : faqs)

    const getFaqsByCategory = (catId: string) => {
        const dbFaqs = getVisibleFaqs().filter(f => f.category === catId)
        if (!search.trim()) return dbFaqs
        return dbFaqs.filter((f: any) => matchQuery(f, search))
    }

    const getAllFaqs = () => {
        const dbFaqs = getVisibleFaqs()
        if (!search.trim()) return dbFaqs
        return dbFaqs.filter((f: any) => matchQuery(f, search))
    }

    const handleSearch = async () => {
        const keyword = search.trim()
        setSearchResult(null)
        setSubmitNotice(null)
        if (!keyword) {
            setSearchPulse((prev) => prev + 1)
            return
        }
        try {
            const submitRes = await fetch('/api/faq/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: keyword })
            })
            if (!submitRes.ok) {
                throw new Error('submit failed')
            }
            setSubmitNotice({
                type: 'success',
                message: locale === 'zh' ? '已提交问题，我们会尽快回复。' : 'Submitted. We will get back to you shortly.'
            })
            setSearch('')
        } catch {
            setSubmitNotice({
                type: 'error',
                message: locale === 'zh' ? '提交失败，请稍后再试。' : 'Submit failed. Please try again.'
            })
        }
        setSearchLoading(true)
        try {
            const res = await fetch(`/api/faq/search?q=${encodeURIComponent(keyword)}`)
            const data = await res.json()
            if (data?.found) {
                setSearchResult({ question: data.question || keyword, answer: data.answer || '' })
            } else {
                setSearchPulse((prev) => prev + 1)
            }
        } catch {
            setSearchPulse((prev) => prev + 1)
        } finally {
            setSearchLoading(false)
        }
    }

    const decisionChecklist =
        locale === 'zh'
            ? [
                '流程无忧 - 全流程管理，简化复杂度',
                '品质可靠 - 全方位严控，所见即所得',
                '服务稳定 - 快速响应，售后无忧',
            ]
            : [
                'Process is stress-free - Full process management, simplifying complexity',
                'Quality is assured - Thorough control at every level, seeing is believing',
                'Service is reliable - Prompt response, worry-free after-sales support',
            ]

    useEffect(() => {
        if (locale === 'zh') preload(faqs.flatMap((f) => [f.question, f.answer]))
    }, [locale, faqs, preload])

    useEffect(() => {
        setSearchResult(null)
    }, [search])

    const normalize = (text: string) => (text || '').toLowerCase()
    const matchQuery = (faq: FAQ, q: string) => {
        const needle = normalize(q)
        if (!needle) return true
        const translatedQuestion = translate(faq.question)
        const translatedAnswer = translate(faq.answer)
        return (
            normalize(faq.question).includes(needle) ||
            normalize(faq.answer).includes(needle) ||
            normalize(translatedQuestion).includes(needle) ||
            normalize(translatedAnswer).includes(needle)
        )
    }

    useEffect(() => {
        const initial = categories.find((cat) => getFaqsByCategory(cat.id).length > 0)
        if (initial) setOpenCategories([initial.id])
    }, [faqs, locale])

    const toggleAccordion = (id: string | number) => {
        setOpenId(openId === id ? null : id)
    }

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans relative pb-20">
            {/* ======== HEADER (Site Standard) ======== */}
            {/* ======== HEADER (Site Standard) ======== */}
            <SiteHeader />

            {/* ======== FAQ HERO (Redesigned to Light/Professional) ======== */}
            <PageBanner
                page="faq"
                fallbackTitle={t.luxury.faqPage.title}
                fallbackDesc={t.luxury.faqPage.subtitle}
                fallbackImage="/images/faq-hero.png"
            />

            {/* ======== FAQ MAIN CONTENT (Prototype Style) ======== */}
            <section className="mt-6 md:mt-12 px-4 md:px-6">
                <div className="max-w-6xl mx-auto rounded-2xl md:rounded-3xl border border-white/10 bg-black/40 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur overflow-hidden">
                    <div className="p-6 md:p-16 space-y-12 md:space-y-20">
                        <div className="text-left mb-16">
                            <div className="text-xs uppercase tracking-[0.5em] text-[#c5a059] mb-4">{t.luxury.faqPage.title}</div>
                            <h2 className="text-[24px] md:text-5xl font-serif font-bold text-white mb-6" data-aos="fade-right">{t.nav.faq}</h2>
                            <p className="text-white/60 text-base max-w-2xl font-normal leading-relaxed" data-aos="fade-up" data-aos-delay="200">
                                {locale === 'zh'
                                    ? '这些回答是经过深度推敲且具有实操意义的 —— 客户通常基于清晰度和风险控制来做决定，而不是营销口号。'
                                    : 'Onespace is tailor-made for you – eliminating concerns is our top priority.'}
                            </p>
                            <div className="mt-6 grid gap-3 text-sm text-white/60">
                                {decisionChecklist.map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-[#c5a059]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-4">
                                <button
                                    onClick={openQuoteModal}
                                    className="bg-[#c5a059] text-black px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#e2b05e] transition-colors"
                                >
                                    {t.luxury.getQuote}
                                </button>
                                <Link
                                    href="/contact"
                                    className="border border-[#c5a059] text-[#c5a059] px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#c5a059]/10 transition-colors"
                                >
                                    {locale === 'zh' ? '快速咨询' : 'Quick Inquiry'}
                                </Link>
                            </div>
                            <div className="mt-8 flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={locale === 'zh' ? '请把你的顾虑交给我' : 'Please entrust your concerns to me'}
                                        className="w-full bg-[#1d1d1f] border border-white/10 rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#c5a059]"
                                    />
                                    {search.trim().length > 0 && (
                                        <button
                                            onClick={() => setSearch('')}
                                            type="button"
                                            aria-label={locale === 'zh' ? '清除输入' : 'Clear input'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        handleSearch()
                                    }}
                                    disabled={searchLoading}
                                    className="bg-[#c5a059] text-black px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-[0.2em]"
                                >
                                    {searchLoading ? (locale === 'zh' ? '发送中...' : 'Sending...') : (locale === 'zh' ? '发送' : 'Send')}
                                </button>
                            </div>
                            {submitNotice && (
                                <div className={`mt-3 text-sm ${submitNotice.type === 'success' ? 'text-[#c5a059]' : 'text-red-400'}`}>
                                    {submitNotice.message}
                                </div>
                            )}
                            {searchResult && (
                                <div className="mt-5 rounded-2xl border border-[#c5a059]/40 bg-black/50 p-5 text-left">
                                    <div className="text-xs uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {locale === 'zh' ? '搜索结果' : 'Search Result'}
                                    </div>
                                    <div className="text-white font-semibold mb-2">{translate(searchResult.question)}</div>
                                    <div className="text-white/70 text-sm leading-relaxed">{translate(searchResult.answer) || (locale === 'zh' ? '暂无答案' : 'No answer')}</div>
                                </div>
                            )}
                        </div>

                        {categories.map((cat, categoryIndex) => {
                            const catFaqs = getFaqsByCategory(cat.id)
                            if (catFaqs.length === 0) return null

                            const isOpen = openCategories.includes(cat.id) || !!search
                            return (
                                <div key={cat.id} className="animate-fade-in-up" data-aos="fade-up" data-aos-delay={categoryIndex * 100}>
                                    <button
                                        onClick={() => toggleCategory(cat.id)}
                                        className="w-full text-left flex items-center justify-between mb-5 md:mb-10"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <span className="w-1 h-5 md:h-7 bg-[#c5a059]" />
                                            <h3 className="text-lg md:text-xl font-bold text-white">{cat.title}</h3>
                                        </div>
                                        <span className="text-xs md:text-base text-blue-400 cursor-pointer">{isOpen ? (locale === 'zh' ? '收起' : 'Collapse') : (locale === 'zh' ? '展开' : 'Expand')}</span>
                                    </button>
                                    {isOpen && (
                                        <>
                                            <div className="space-y-4">
                                                {catFaqs.map((faq: any, idx: number) => {
                                                    const itemKey = faq.id ?? `${cat.id}-${idx}`
                                                    return (
                                                        <FAQItem
                                                            key={itemKey}
                                                            itemId={itemKey}
                                                            faq={faq}
                                                            translate={translate}
                                                            isOpen={openId === itemKey}
                                                            onToggle={() => toggleAccordion(itemKey)}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}

                        {/* Other FAQ Category */}
                        {getAllFaqs().filter((f: any) => !categories.some(c => c.id === f.category)).length > 0 && (
                            <div className="animate-fade-in-up" data-aos="fade-up">
                                <button
                                    onClick={() => toggleCategory('other')}
                                    className="w-full text-left flex items-center justify-between mb-8"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-[#c5a059] rounded-full" />
                                        <h3 className="text-lg font-bold text-white">{locale === 'zh' ? '其他常见问题' : 'Other Questions'}</h3>
                                    </div>
                                    <span className="text-xs md:text-base text-white/50">{openCategories.includes('other') || !!search ? (locale === 'zh' ? '收起' : 'Collapse') : (locale === 'zh' ? '展开' : 'Expand')}</span>
                                </button>
                                {(openCategories.includes('other') || !!search) && (
                                    <div className="space-y-4">
                                        {getAllFaqs().filter((f: any) => !categories.some(c => c.id === f.category)).map((faq: any, idx: number) => {
                                            const itemKey = faq.id ?? `demo-${idx}`
                                            return (
                                                <FAQItem
                                                    key={itemKey}
                                                    itemId={itemKey}
                                                    faq={faq}
                                                    translate={translate}
                                                    isOpen={openId === itemKey}
                                                    onToggle={() => toggleAccordion(itemKey)}
                                                />
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ======== CONTACT CTA (Prototype Icons Style) ======== */}
            <section className="py-10 md:py-24 px-6 relative" data-aos="fade-in">
                <div className="max-w-6xl mx-auto bg-black/40 p-6 md:p-20 rounded-[40px] text-center overflow-hidden shadow-2xl border border-white/10 relative backdrop-blur">
                    {/* Decorative Background (Simulation of the prototype's lab-like background) */}
                    <div className="absolute inset-0 z-0 opacity-[0.03]">
                        <img src="/images/hero_luxury_house.png" className="w-full h-full object-cover grayscale" alt="" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-[20px] md:text-[48px] font-serif font-bold mb-8 text-white leading-tight" data-aos="zoom-in">
                            {t.luxury.faqPage.ctaTitle}
                        </h2>

                        <div className="w-16 h-1.5 bg-[#c5a059] mx-auto mb-12 rounded-full" />

                        <p className="text-xl md:text-2xl text-white/80 mb-12 font-medium tracking-tight max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                            {t.luxury.faqPage.ctaSubtitle}
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6" data-aos="fade-up" data-aos-delay="300">
                            <Link
                                href="/contact"
                                className="bg-[#c5a059] text-black px-12 py-5 rounded-[10px] text-lg font-bold hover:bg-[#e2b05e] transition-all shadow-xl group inline-flex items-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-1.44a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                {t.team.contactBtn}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== FOOTER (Site Standard - Dark) ======== */}
            <SiteFooter />

            {/* ======== QUOTE MODAL (Synced with Home) ======== */}
            {/* Handled globally via Context */}
        </div>
    )
}

function FAQItem({
    faq,
    isOpen,
    onToggle,
    itemId,
    translate
}: {
    faq: FAQ
    isOpen: boolean
    onToggle: () => void
    itemId: string | number
    translate: (text: string) => string
}) {
    return (
        <div id={`faq-item-${itemId}`} data-aos="fade-up">
            <div
                className={`transition-all duration-300 rounded-xl md:rounded-[20px] overflow-hidden ${isOpen ? 'bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/10' : 'bg-white/5 hover:bg-white/10 shadow-sm border border-transparent'}`}
            >
                <div
                    className="flex justify-between items-center p-5 md:p-8 md:px-10 cursor-pointer group gap-4"
                    onClick={onToggle}
                >
                    <h4 className={`text-sm md:text-xl font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/80'}`}>
                        {translate(faq.question)}
                    </h4>
                    <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#c5a059] border-[#c5a059] rotate-180' : 'group-hover:border-[#c5a059] bg-black/40'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "black" : "#c5a059"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                <div className={isOpen ? 'block' : 'hidden'}>
                    <div className="px-5 pb-6 md:px-12 md:pb-10 text-white/60 leading-relaxed text-sm md:text-lg font-normal border-t border-white/10 pt-4 md:pt-8">
                        {translate(faq.answer)}
                    </div>
                </div>
            </div>
        </div>
    )
}

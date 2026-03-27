'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'

import LanguageSwitcher from './LanguageSwitcher'

interface ProcessStep {
    id: number
    title: string
    description: string
    image: string
    order: number
}

import { useQuoteModal } from '@/lib/QuoteModalContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import PageBanner from '@/components/PageBanner'

export default function ProcessClient() {
    const { t, locale, setLocale } = useLanguage()
    const { openQuoteModal } = useQuoteModal()
    const [processes, setProcesses] = useState<ProcessStep[]>([])
    const { translate, preload } = useZhRuntimeTranslator(locale, {})

    useEffect(() => {
        fetch('/api/processes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProcesses(data)
                }
            })
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        preload([
            ...processes.flatMap((p) => [p.title, p.description]),
            t.luxury.processPage.hero.title,
            t.luxury.processPage.hero.desc,
            t.luxury.processPage.title,
            t.luxury.processPage.cta.line1,
            t.luxury.processPage.cta.line2,
            t.luxury.contactTitle,
        ])
    }, [locale, processes, preload, t])

    // Optional safety check if translations are not yet loaded or structure mismatch
    if (!t?.luxury?.processPage) {
        return <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">Loading...</div>
    }

    // Image mapping for the 5 steps
    const stepImages = [
        "/images/service_qc.png",
        "/images/service_logistics.png",
        "/images/service_sourcing.png",
        "/images/service_project.png",
        "/images/service_installation.png"
    ]

    return (
        <div className="bg-[#121212] min-h-screen text-white font-sans selection:bg-[#c5a059] selection:text-black">
            {/* Header */}
            {/* Header */}
            <SiteHeader />

            {/* Hero Section */}
            <PageBanner
                page="process"
                fallbackTitle={translate(t.luxury.processPage.hero.title)}
                fallbackDesc={translate(t.luxury.processPage.hero.desc)}
                fallbackImage="/images/service_design.png"
            />

            {/* Main Content: Steps */}
            <section className="py-12 md:py-24 px-6 relative bg-[#121212]">
                <div className="max-w-7xl mx-auto space-y-16 md:space-y-32">
                    <div className="text-center mb-10 md:mb-20">
                        <h2 className="text-[24px] md:text-4xl font-serif text-[#c5a059] mb-4" data-aos="fade-up">{translate(t.luxury.processPage.title)}</h2>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent"></div>
                    </div>

                    {processes.map((step, index) => {
                        return (
                            <div key={step.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-12 items-center group`} data-aos="fade-up" data-aos-delay={index * 100}>
                                {/* Image Side */}
                                <div className="w-full md:w-1/2 relative">
                                    <div className="relative z-10 overflow-hidden aspect-[4/3] rounded-sm shadow-2xl">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                        <img
                                            src={step.image || stepImages[index % stepImages.length]}
                                            alt={step.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        {/* Number Overlay */}
                                        <div className="absolute top-0 right-0 bg-[#c5a059] text-black w-16 h-16 flex items-center justify-center text-3xl font-serif font-bold z-20">
                                            0{index + 1}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Side */}
                                <div className="w-full md:w-1/2 space-y-6">
                                    <h3 className="text-[24px] md:text-3xl font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors duration-300">
                                        {translate(step.title)}
                                    </h3>
                                    <div className={`w-12 h-1 bg-[#c5a059] ${index % 2 !== 0 ? 'ml-auto md:ml-0' : ''}`}></div>
                                    <p className="text-gray-400 leading-loose text-base md:text-lg">
                                        {translate(step.description)}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-10 md:py-24 bg-[#1a1a1a] relative overflow-hidden" data-aos="fade-in">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-[20px] md:text-[40px] font-serif font-bold text-white mb-6 uppercase tracking-wider leading-tight" data-aos="zoom-in">
                        {translate(t.luxury.processPage.cta.line1)}
                    </h2>
                    <p className="text-gray-400 mb-10 text-lg" data-aos="fade-up" data-aos-delay="200">
                        {translate(t.luxury.processPage.cta.line2)}
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block px-12 py-4 bg-[#c5a059] text-black font-bold text-lg uppercase tracking-[0.2em] hover:bg-[#d4b375] hover:scale-105 transition-all shadow-[0_0_30px_rgba(197,160,89,0.3)] rounded-[10px]"
                        data-aos="fade-up" data-aos-delay="400"
                    >
                        {translate(t.luxury.contactTitle)}
                    </Link>
                </div>
            </section>

            {/* Site Footer - Matching HomeClient */}
            <SiteFooter />

            {/* Get Quote Modal - Handled Globally */}

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
                .site-logo {
                    font-size: 36px !important;
                    line-height: 1;
                }
            `}</style>
        </div>
    )
}

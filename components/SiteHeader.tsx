'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSiteLogo } from '@/app/actions/getLogo'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { usePathname } from 'next/navigation'
import { useQuoteModal } from '@/lib/QuoteModalContext'
import { Menu, X } from 'lucide-react'

export default function SiteHeader() {
    const { t } = useLanguage()
    const pathname = usePathname()
    const { openQuoteModal } = useQuoteModal()
    const [logo, setLogo] = useState<any>(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Hard reset scroll lock on mount to avoid stale inline styles after route transitions.
    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        html.style.removeProperty('overflow')
        body.style.removeProperty('overflow')

        return () => {
            html.style.removeProperty('overflow')
            body.style.removeProperty('overflow')
        }
    }, [])

    useEffect(() => {
        getSiteLogo().then(setLogo)
    }, [])

    const getLinkClass = (path: string) => {
        // Simple and robust check:
        // 1. If link is '/', strict match is required.
        // 2. If link is not '/', check if pathname starts with it.
        //    This handles /team, /team/, /team/abc correctly.
        const isActive = path === '/'
            ? pathname === '/'
            : pathname?.startsWith(path)

        return `nav-link relative py-1 transition-all duration-200 border-b-2 ${isActive
            ? 'text-[#c5a059] border-[#c5a059] active'
            : 'text-gray-200 border-transparent hover:text-[#c5a059]'
            }`
    }

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            {logo ? (
                                <img
                                    src={logo.image}
                                    alt="ONE SPACE"
                                    className="h-[46px] w-auto max-w-[300px] object-contain"
                                />
                            ) : null}
                        </Link>
                        <div className="hidden lg:flex items-center gap-2 text-base text-gray-400 lg:mr-[28px]">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-base uppercase tracking-widest font-medium">
                        <Link href="/" className={getLinkClass('/')}>{t.nav.home}</Link>
                        <Link href="/services" className={getLinkClass('/services')}>{t.nav.services}</Link>
                        <Link href="/process" className={getLinkClass('/process')}>{t.nav.process}</Link>
                        <Link href="/cases" className={getLinkClass('/cases')}>{t.nav.cases}</Link>
                        <Link href="/team" className={getLinkClass('/team')}>{t.nav.team}</Link>
                        <Link href="/faq" className={getLinkClass('/faq')}>{t.nav.faq}</Link>
                        <Link href="/contact" className={getLinkClass('/contact')}>{t.nav.contact}</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop Quote Button */}
                        <button
                            onClick={openQuoteModal}
                            className="!hidden md:!inline-flex btn-gold text-base px-6 py-2 md:ml-[32px]"
                        >
                            {t.luxury.getQuote}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[101] bg-[#333333] transition-all duration-300 ease-out md:hidden flex flex-col translate-x-0 pointer-events-auto">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0 bg-black">
                        <div className="flex items-center gap-2">
                            {logo ? (
                                <img
                                    src={logo.image}
                                    alt="ONE SPACE"
                                    className="object-contain h-8 w-auto brightness-0 invert"
                                />
                            ) : null}
                        </div>
                        <button
                            className="text-white p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={28} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 px-8 py-8 overflow-y-auto bg-[#333333]">
                        <div className="flex flex-col gap-6 text-[17px] text-white font-normal tracking-wide">
                            <Link href="/" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.home}</Link>
                            <Link href="/services" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.services}</Link>
                            <Link href="/process" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.process}</Link>
                            <Link href="/cases" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.cases}</Link>
                            <Link href="/team" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.team}</Link>
                            <Link href="/faq" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.faq}</Link>
                            <Link href="/contact" className="hover:text-[#db2777] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</Link>
                        </div>

                        <div className="mt-auto pt-10 flex flex-col gap-8">
                            <div className="flex items-center gap-4 text-white font-bold text-[17px]">
                                <span>{t.nav.languageLabel}:</span>
                                <div className="bg-gray-500 rounded-full px-1 py-0.5">
                                    <LanguageSwitcher />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    openQuoteModal()
                                    setIsMobileMenuOpen(false)
                                }}
                                className="bg-[#c5a059] text-black text-[16px] font-medium w-full py-3 rounded-[4px] hover:bg-[#e2b05e] transition-colors tracking-wide"
                            >
                                {t.luxury.getQuote}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

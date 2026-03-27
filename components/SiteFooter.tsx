'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import SocialLoginButtons from '@/components/SocialLoginButtons'

export default function SiteFooter() {
    const { t } = useLanguage()

    return (
        <footer className="bg-black text-white pt-[15px] md:pt-20 pb-10 px-6 mt-[15px] md:mt-20 border-t border-white/10 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-10 md:mb-20">
                    {/* Column 1: Contact Info */}
                    <div className="lg:col-span-1">
                        <h2 className="text-3xl font-serif font-bold mb-5 md:mb-10 text-white">{t.luxury.contactTitle}</h2>
                        <div className="space-y-5 md:space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 text-[#38bdf8] text-2xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {t.luxury.addressContent}
                                </p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="text-[#38bdf8] text-2xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </div>
                                <p className="text-gray-300 text-sm">{t.luxury.emailContent}</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="text-[#38bdf8] text-2xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-1.44a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                </div>
                                <p className="text-gray-300 text-sm">{t.luxury.phoneContent}</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Service */}
                    <div className="hidden md:block">
                        <h3 className="text-xl font-bold mb-8 text-white">{t.footer.services}</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.luxury.serviceTypePage.serviceTypes.items.softFurnishing}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.luxury.serviceTypePage.serviceTypes.items.interior}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.luxury.serviceTypePage.serviceTypes.items.architectural}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.footer.landscape}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.footer.procurement}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.footer.logistics}</Link></li>
                            <li><Link href="/services" className="hover:text-gold-gradient transition-colors">{t.footer.installation}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div className="hidden md:block">
                        <h3 className="text-xl font-bold mb-8 text-white">{t.footer.resources}</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><Link href="/cases" className="hover:text-gold-gradient transition-colors">{t.nav.cases}</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors text-gray-300">{t.nav.faq}</Link></li>
                            <li><Link href="/product" className="hover:text-gold-gradient transition-colors">{t.nav.product}</Link></li>
                            <li><Link href="/videos" className="hover:text-gold-gradient transition-colors">{t.footer.showroomVideo}</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="hidden md:block">
                        <h3 className="text-xl font-bold mb-8 text-white">{t.nav.contact}</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><a href="https://wa.me/8618126679031" target="_blank" className="hover:text-gold-gradient transition-colors">{t.nav.whatsapp}</a></li>
                            <li><Link href="/about" className="text-white hover:text-gold-gradient transition-colors">{t.footer.aboutUs}</Link></li>
                        </ul>
                        <SocialLoginButtons className="mt-[150px] justify-start" />
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                    <SocialLoginButtons className="mb-6 md:hidden" />
                    <p className="text-gray-400 text-sm">
                        {t.footer.copyright}
                    </p>
                </div>
            </div>
        </footer>
    )
}

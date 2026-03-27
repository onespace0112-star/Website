'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import PageBanner from './PageBanner'

interface TeamMember {
    id: number
    name: string
    position: string
    image: string | null
    skills: string | null
    workingYears: string | null
    responsibilities: string | null
    order: number
}

interface TeamPageClientProps {
    teamMembers: TeamMember[]
}

export default function TeamPageClient({ teamMembers }: TeamPageClientProps) {
    const { t, locale } = useLanguage()
    const { translate, preload } = useZhRuntimeTranslator(locale, (t as any).teamMap || {})

    React.useEffect(() => {
        const texts: string[] = []
        for (const member of teamMembers) {
            if (member.position) texts.push(member.position)
            if (member.workingYears) texts.push(member.workingYears)
            if (member.responsibilities) texts.push(member.responsibilities)
            if (member.skills) texts.push(...member.skills.split(/[,，]/).map((s) => s.trim()))
        }
        preload(texts)
    }, [locale, teamMembers, preload])

    return (
        <div className="min-h-screen text-[#1a1a1a] font-sans relative bg-[#F8F9FA]">
            <SiteHeader />

            <main className="relative z-10">
                {/* Hero Section with Background */}
                {/* Hero Section with Background */}
                <PageBanner
                    page="team"
                    fallbackTitle={t.luxury.teamPage?.title || 'Team Members'}
                    fallbackDesc={t.luxury.teamPage?.desc || ''}
                    fallbackImage="/team_header_bg.png"
                />

                <div className="max-w-[1440px] mx-auto px-4 md:px-6 pb-20 mt-[60px]">
                    {/* Team Grid */}
                    {teamMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={member.id}
                                    className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] group min-h-[180px] flex"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
                                    {/* Content Side (Left) */}
                                    <div className="relative z-10 flex-1 p-5 md:p-6 flex flex-col justify-center max-w-[65%]">
                                        <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-2 leading-tight">
                                            {member.name}
                                        </h3>

                                        <div className="space-y-2">
                                            <p className="text-sm font-bold text-[#4B5563]">
                                                {translate(member.position)}
                                            </p>

                                            {member.workingYears && (
                                                <div className="group/tooltip relative">
                                                    <p className="text-sm font-medium text-gray-500 line-clamp-2">
                                                        {translate(member.workingYears)}
                                                    </p>
                                                    <div className="absolute left-0 bottom-full mb-2 w-max max-w-[240px] p-3 bg-gray-900/95 backdrop-blur text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[100] pointer-events-none transform translate-y-2 group-hover/tooltip:translate-y-0 text-left whitespace-pre-wrap">
                                                        {translate(member.workingYears)}
                                                        <div className="absolute left-4 -bottom-1 w-2 h-2 bg-gray-900/95 rotate-45"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {member.responsibilities && (
                                                <div className="group/tooltip relative">
                                                    <div className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                                        {translate(member.responsibilities)}
                                                    </div>
                                                    <div className="absolute left-0 bottom-full mb-2 w-max max-w-[280px] p-3 bg-gray-900/95 backdrop-blur text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[100] pointer-events-none transform translate-y-2 group-hover/tooltip:translate-y-0 text-left whitespace-pre-wrap">
                                                        {translate(member.responsibilities)}
                                                        <div className="absolute left-4 -bottom-1 w-2 h-2 bg-gray-900/95 rotate-45"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tags / Skills */}
                                        {member.skills && member.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {member.skills.split(/[,，]/).slice(0, 2).map((skill, i) => (
                                                    <span key={i} className="inline-block bg-[#F3F4F6] text-[#4B5563] text-[10px] px-2 py-1 rounded-md font-medium">
                                                        {translate(skill.trim())}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Side (Right) */}
                                    <div className="absolute right-0 top-0 bottom-0 w-[50%] h-full rounded-r-xl overflow-hidden">
                                        {member.image ? (
                                            <>
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Gradient Fade Mask */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent w-full" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-300 text-4xl">?</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Empty State
                        <div className="py-20 text-center text-gray-500">
                            <p>{t.team.emptyState}</p>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-10 md:mt-24 text-center relative py-12 md:py-20 px-6 rounded-3xl bg-[#1a1a1a] overflow-hidden shadow-2xl" data-aos="zoom-in" data-aos-delay="200">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                        <div className="relative z-10">
                            <h2 className="text-[20px] md:text-[40px] font-serif font-bold mb-6 leading-tight text-white whitespace-pre-line">
                                {t.team.ctaTitle}
                            </h2>
                            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-4xl mx-auto leading-relaxed whitespace-pre-line">
                                {t.team.ctaDesc} <span className="text-[#c5a059] font-bold tracking-wider">{t.luxury.phoneContent}</span>
                            </p>

                            <div className="flex justify-center">
                                <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c5a059] text-black px-10 py-4 text-lg uppercase tracking-widest font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#c5a059]/20">
                                    {t.team.contactBtn}
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <SiteFooter />
        </div>
    )
}

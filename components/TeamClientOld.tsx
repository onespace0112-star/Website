'use client'

import React from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

interface TeamMember {
    id: number
    name: string
    position: string
    image: string | null
    serviceMotion: string | null
    skills: string | null
    order: number
}

interface TeamClientProps {
    teamMembers: TeamMember[]
}

export default function TeamClient({ teamMembers }: TeamClientProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen text-white font-sans relative bg-[#0a0a0a]">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'url("/images/noise.png")', // Using noise texture if available, or just fallback
                    backgroundRepeat: 'repeat',
                }}
            />
            {/* Gradient Orbs */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-[#c5a059] rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-[#407cff] rounded-full mix-blend-screen filter blur-[128px] opacity-5 pointer-events-none" />

            <SiteHeader />

            <main className="relative z-10">
                {/* Hero Section with Background */}
                <section className="relative h-[60vh] min-h-[500px] flex flex-col justify-center items-center text-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/team_hero_bg.png"
                            alt="Team Hero Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 max-w-5xl px-6 hero-content pt-20">
                        <h1 className="text-[clamp(32px,6vw,70px)] font-serif font-bold leading-tight mb-4 animate-fade-in-up">
                            <span className="text-white">Systematic services require the support of a </span>
                            <br className="hidden md:block" />
                            <span className="text-gold-gradient">professional team</span>
                        </h1>

                        <div className="flex items-center justify-center gap-6 mt-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="h-px w-12 bg-gold-gradient opacity-50" />
                            <p className="text-lg md:text-xl uppercase tracking-[0.2em] font-light text-gray-300 max-w-3xl">
                                For each project, we will match one-on-one professionals for its implementation
                            </p>
                            <div className="h-px w-12 bg-gold-gradient opacity-50" />
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 py-20">
                    {/* Page Title */}


                    {/* Team Grid */}
                    {teamMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={member.id}
                                    className="group relative bg-[#141414] border border-white/5 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_30px_-10px_rgba(197,160,89,0.2)]"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 bg-[#1a1a1a]">
                                                <span className="text-4xl">?</span>
                                            </div>
                                        )}
                                        {/* Gradient Overlay on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                    </div>

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#c5a059] transition-colors font-serif tracking-wider uppercase">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
                                            {member.position}
                                        </p>
                                    </div>

                                    {/* Border Glow Effect */}
                                    <div className="absolute inset-0 border border-[#c5a059] opacity-0 group-hover:opacity-30 rounded-xl transition-opacity duration-500 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Empty State / Fallback - if no DB data, showing placeholders or message
                        <div className="py-20 text-center text-gray-500">
                            <p>Team members being updated...</p>
                        </div>
                    )}

                    {/* CTA Section from Image */}
                    <div className="mt-32 text-center relative py-16 px-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a059]/10 to-transparent animate-pulse-slow pointer-events-none" />

                        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 leading-relaxed text-white">
                            Please send us your project details. We will contact you within 24 hours.
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-4xl mx-auto leading-relaxed">
                            If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at:
                            <br className="hidden md:block" />
                            <span className="text-[#c5a059] font-bold tracking-wider">+86 18126679031</span>
                        </p>

                        <a
                            href="https://wa.me/8618126679031"
                            target="_blank"
                            className="inline-flex items-center gap-2 btn-gold px-10 py-4 text-lg uppercase tracking-widest font-bold rounded hover:scale-105 transition-transform"
                        >
                            Contact via WhatsApp
                        </a>
                    </div>

                </div>
            </main>

            <SiteFooter />
        </div>
    )
}

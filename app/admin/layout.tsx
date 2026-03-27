'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

const bgMap: Record<string, string> = {
    '/admin': '/images/admin_bg.png',
    '/admin/projects': '/images/interior_european_wooden.png',
    '/admin/services': '/images/service_design.png',
    '/admin/team': '/images/team_hero_bg.png',
    '/admin/faq': '/images/luxury_bg.png',
    '/admin/faq/questions': '/images/luxury_bg.png',
    '/admin/quotes': '/images/footer_bg.png',
    '/admin/inquiries': '/images/adv_1.png',
    '/admin/users': '/images/adv_2.png',
    '/admin/ai-config': '/images/adv_3.png',
    '/admin/home/advantages': '/images/adv_4.png',
    '/admin/home/banner': '/images/adv_5.png',
    '/admin/home/cases': '/images/adv_6.png',
    '/admin/home/global-collect': '/images/adv_2.png',
    '/admin/home/gallery': '/images/adv_1.png',
    '/admin/video': '/images/adv_3.png',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Find the best matching background (longest key match)
    const getBgImage = () => {
        const sortedKeys = Object.keys(bgMap).sort((a, b) => b.length - a.length)
        const match = sortedKeys.find(key => pathname === key || pathname?.startsWith(key + '/'))
        return match ? bgMap[match] : '/images/admin_bg.png'
    }

    const bgImage = getBgImage()

    return (
        <div className="min-h-screen font-sans text-slate-800 flex relative selection:bg-[#E2B05E]/30">
            {/* Background Image Layer with improved overlays */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
                style={{ backgroundImage: `url('${bgImage}')` }}
            >
                {/* Multi-layered overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/97 via-[#F4F7FE]/95 to-slate-100/97"></div>
                <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
            </div>

            <div className="relative z-10 flex w-full">
                <AdminSidebar />
                <main className="flex-1 ml-64 min-h-screen relative">
                    {/* Top bar / Header shell could go here */}
                    <div
                        // Force remount on route change to avoid stale client state when navigating between admin pages.
                        key={pathname}
                        className="p-8 md:p-12 animate-in fade-in duration-150"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

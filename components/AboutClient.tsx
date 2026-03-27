'use client'

import React, { useState, useEffect } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

type Header = {
    id: number
    image: string
    title: string
    titleZh: string | null
    height: number
    description: string | null
    descriptionZh: string | null
    order: number
}

type Intro = {
    id: number
    image: string
    description: string
    descriptionZh: string | null
    order: number
}

type Milestone = {
    id: number
    image: string | null
    imageZh: string | null
    description: string
    descriptionZh: string | null
    order: number
}

type Vision = {
    id: number
    image: string
    description: string
    descriptionZh: string | null
    order: number
}

export default function AboutClient() {
    const { locale } = useLanguage()

    const [headerData, setHeaderData] = useState<Header | null>(null)
    const [introData, setIntroData] = useState<Intro | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [visionData, setVisionData] = useState<Vision | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch in parallel
                const [headerRes, introRes, milestoneRes, visionRes] = await Promise.all([
                    fetch('/api/admin/about/header'),
                    fetch('/api/admin/about/intro'),
                    fetch('/api/admin/about/milestone'),
                    fetch('/api/admin/about/vision')
                ])

                const headerJson = await headerRes.json()
                const introJson = await introRes.json()
                const milestoneJson = await milestoneRes.json()
                const visionJson = await visionRes.json()

                if (Array.isArray(headerJson) && headerJson.length > 0) setHeaderData(headerJson[0])
                if (Array.isArray(introJson) && introJson.length > 0) setIntroData(introJson[0])
                if (Array.isArray(milestoneJson)) setMilestones(milestoneJson)
                if (Array.isArray(visionJson) && visionJson.length > 0) setVisionData(visionJson[0])

            } catch (error) {
                console.error('Failed to fetch About Us data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllData()
    }, [])

    // Fallback data
    const defaultMilestones = [
        { id: 1, image: null, imageZh: null, order: 1, description: locale === 'zh' ? '2016 出口家具到12个国家' : '2016 Export furniture to 12 countries', descriptionZh: '2016 出口家具到12个国家' },
        { id: 2, image: null, imageZh: null, order: 2, description: locale === 'zh' ? '2020 业务扩展，印度/澳大利亚全屋项目' : '2020 Business expansion, India, Australia launches whole-house project', descriptionZh: '2020 业务扩展，印度/澳大利亚全屋项目' },
        { id: 3, image: null, imageZh: null, order: 3, description: locale === 'zh' ? '2021 建立设计+工厂数字平台' : '2021 Set up design+factory digital platform', descriptionZh: '2021 建立设计+工厂数字平台' },
        { id: 4, image: null, imageZh: null, order: 4, description: locale === 'zh' ? '2022 扩展国际全案服务到50国' : '2022 Expand international Full-service to 50 countries', descriptionZh: '2022 扩展国际全案服务到50国' },
        { id: 5, image: null, imageZh: null, order: 5, description: locale === 'zh' ? '2023 进入卢浮宫' : '2023 Enter Louvre', descriptionZh: '2023 进入卢浮宫' },
        { id: 6, image: null, imageZh: null, order: 6, description: locale === 'zh' ? '2024 总部位于龙光尚街大厦' : '2024 HQ locates in Leong Glorious Supply and Marketing Building', descriptionZh: '2024 总部位于龙光尚街大厦' },
        { id: 7, image: null, imageZh: null, order: 0, description: locale === 'zh' ? '2025 在印度/澳大利亚/迪拜设立分公司' : '2025 Establish branches in India, Australia&Dubai', descriptionZh: '2025 在印度/澳大利亚/迪拜设立分公司' },
    ]

    const displayMilestones = (() => {
        // 如果数据库有数据
        if (milestones.length > 0) {
            // 检查是否有中文数据
            const hasChinese = milestones.some(m => m.descriptionZh)
            // 中文模式下如果没有中文数据，使用默认中文
            if (locale === 'zh' && !hasChinese) {
                return defaultMilestones
            }
            return milestones
        }
        // 没有数据库数据，使用默认
        return defaultMilestones
    })()

    const parseMilestone = (desc: string) => {
        // Simple parsing: assume first word/number is year if it looks like one, or just treat whole thing as desc
        const match = desc.match(/^(\d{4})\s+(.+)/)
        if (match) {
            return { year: match[1], text: match[2] }
        }
        return { year: '', text: desc }
    }


    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#c5a059] selection:text-white">
            <SiteHeader />

            {/* Hero Section */}
            {headerData ? (
                <div
                    className="relative w-full bg-cover bg-center flex items-center justify-center"
                    style={{ height: headerData.height ? `${headerData.height}px` : '400px', backgroundImage: `url(${headerData.image})` }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 text-center px-6">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-white">
                            {locale === 'zh' ? (headerData.titleZh || headerData.title) : headerData.title}
                        </h1>
                        {(locale === 'zh' ? (headerData.descriptionZh || headerData.description) : headerData.description) && (
                            <p className="text-gray-200 max-w-2xl mx-auto">
                                {locale === 'zh' ? (headerData.descriptionZh || headerData.description) : headerData.description}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="pt-24 pb-10 px-6 max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-white">
                        {locale === 'zh' ? '关于 ONE SPACE' : 'About ONE SPACE'}
                    </h1>
                    <p className="text-white max-w-2xl mx-auto">
                        {locale === 'zh' ? '全球一站式解决方案提供商' : 'Global One-Stop Solution Provider'}
                    </p>
                </div>
            )}


            <main className="max-w-7xl mx-auto px-6 space-y-24 pb-20 pt-10">

                {/* Company Introduction */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-video lg:aspect-[4/3] rounded-[10px] overflow-hidden border border-white/10">
                        <img
                            src={introData?.image || "/images/interior_european_wooden.png"}
                            alt="ONE SPACE Showroom"
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                            {locale === 'zh' ? '公司介绍' : 'Company Introduction'}
                        </h2>
                        <div className="w-12 h-1 bg-[#c5a059] mb-6" />
                        <div className="prose prose-invert text-gray-300 space-y-4 leading-relaxed text-sm md:text-base text-justify whitespace-pre-wrap">
                            {(() => {
                                if (locale === 'zh') {
                                    // 中文模式：优先使用数据库中文，其次使用默认中文
                                    if (introData?.descriptionZh) {
                                        return introData.descriptionZh
                                    }
                                    // 没有数据库中文数据，使用默认中文
                                    return (
                                        <>
                                            <p>ONE SPACE 自2016年成立以来，位于中国家具之都佛山，是一站式整体解决方案出口供应商。我们要提供广泛的产品，包括橱柜、衣柜、门窗、石材、木地板、楼梯栏杆、卫浴洁具、灯具、壁纸、窗帘、家具、金属和玻璃以及电器。</p>
                                            <p>我们是源头工厂，部分产品自产自销，实现了工贸一体化。目前员工超过30人，业务出口至50多个国家。线下展厅总面积约20,000平方米。</p>
                                        </>
                                    )
                                } else {
                                    // 英文模式：优先使用数据库英文，其次使用默认英文
                                    if (introData?.description) {
                                        return introData.description
                                    }
                                    return (
                                        <>
                                            <p>ONE SPACE since 2016, located in Foshan, which is known as the &quot;Home of Home Furnishings in China&quot;, an one-stop overall solutions exporter supplier. Providing a wide range of products including kitchen cabinets, wardrobes, doors and windows, stone, wood flooring, stair railings, ceramic sanitary ware, lighting fixtures, wallpaper, curtains, furniture, metal and glass, and electrical appliances.</p>
                                            <p>Some of the products are provided by our own factories at the source, making it semi-integrated in manufacturing and trade. Now we have over 30 employees and our business exports to more than 50 countries. The total area of our offline showroom is approx 20,000m².</p>
                                        </>
                                    )
                                }
                            })()}
                        </div>
                    </div>
                </section>

                {/* Development Milestone */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1 space-y-6">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                            {locale === 'zh' ? '发展历程' : 'Development Milestone'}
                        </h2>
                        <div className="w-12 h-1 bg-[#c5a059] mb-6" />
                        <div className="prose prose-invert text-gray-300 space-y-4 leading-relaxed text-sm md:text-base text-justify whitespace-pre-wrap">
                            {displayMilestones.map((item, index) => (
                                <p key={index}>
                                    {locale === 'zh' ? (item.descriptionZh || item.description) : item.description}
                                </p>
                            ))}
                        </div>
                    </div>
                    {/* Added explicit style for borderRadius to ensure it takes precedence */}
                    <div className="order-1 lg:order-2 relative aspect-video lg:aspect-[4/3] rounded-[10px] overflow-hidden border border-white/10" style={{ borderRadius: '10px' }}>
                        <img
                            src={(locale === 'zh'
                                ? (milestones.find(m => m.imageZh)?.imageZh || milestones.find(m => m.image)?.image)
                                : milestones.find(m => m.image)?.image
                            ) || "/images/hero_luxury_house.png"}
                            alt="Development Milestone"
                            className="object-contain w-full h-full hover:scale-105 transition-transform duration-700 bg-black/50"
                        />
                    </div>
                </section>

                {/* Corporate Vision */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Swapped Order: Image is now Left (lg:order-1), Text is Right (lg:order-2) */}
                    <div className="order-1 lg:order-1 relative aspect-video lg:aspect-[4/3] rounded-[10px] overflow-hidden border border-white/10">
                        <img
                            src={visionData?.image || "/images/adv_1.png"}
                            alt="Corporate Vision Building"
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="order-2 lg:order-2 space-y-6">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                            {locale === 'zh' ? '企业愿景' : 'Corporate Vision'}
                        </h2>
                        <div className="w-12 h-1 bg-[#c5a059] mb-6" />
                        <div className="prose prose-invert text-gray-300 space-y-4 leading-relaxed text-sm md:text-base text-justify whitespace-pre-wrap">
                            {(() => {
                                if (locale === 'zh') {
                                    // 中文模式：优先使用数据库中文，其次使用默认中文
                                    if (visionData?.descriptionZh) {
                                        return visionData.descriptionZh
                                    }
                                    // 没有数据库中文数据，使用默认中文
                                    return (
                                        <>
                                            <p>秉承 “ONE SPACE” 的核心理念，我们致力于成为家居建材行业的全球领导者。通过独特的界面整合全球统一标准，我们提供顶级的全案服务，打破地域和品类的界限。</p>
                                            <p>通过创新设计和数字化赋能，我们连接全球优质资源，创造融合美学与品质的空间解决方案，立志成为最值得信赖的全球空间价值合作伙伴。</p>
                                        </>
                                    )
                                } else {
                                    // 英文模式：优先使用数据库英文，其次使用默认英文
                                    if (visionData?.description) {
                                        return visionData.description
                                    }
                                    return (
                                        <>
                                            <p>With the &quot;ONE SPACE&quot; core concept, we are committed to becoming the global leader in the home building materials industry. By uniquely integrating an interface with global unified standards, we provide one-stop top-notch services, breaking through geographical and category boundaries.</p>
                                            <p>Through innovative design and digital empowerment, we connect with global high-quality resources to create space solutions that combine aesthetics and quality for our customers, and are determined to become a trusted global partner for space value.</p>
                                        </>
                                    )
                                }
                            })()}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="relative w-full py-12 md:py-20 px-6 rounded-2xl overflow-hidden mt-20">
                    <div className="absolute inset-0">
                        <img
                            src="/images/admin_bg.png"
                            alt="CTA Background"
                            className="object-cover w-full h-full opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <h3 className="text-xl md:text-3xl font-serif font-bold mb-6 leading-tight">
                            {locale === 'zh'
                                ? '请发送您的项目详情，我们将在24小时内与您联系'
                                : 'Please send us your project details. We will contact you within 24 hours.'
                            }
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-300 mb-8 justify-center">
                            <p>
                                {locale === 'zh' ? '如需快速获取报价，请随时通过 WhatsApp 联系我们：+86 18126679031' : 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at: +86 18126679031.'}
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-[#c5a059] text-black px-8 py-3 rounded-md font-bold hover:bg-white transition-colors duration-300"
                        >
                            {locale === 'zh' ? '联系我们' : 'CONTACT US'}
                        </Link>
                    </div>
                </section>

            </main>

            <SiteFooter />
        </div>
    )
}

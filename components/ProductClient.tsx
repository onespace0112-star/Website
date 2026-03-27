'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import PageBanner from './PageBanner'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type StyleItem = {
    id: number
    title: string
    imageUrl: string
    pageNum: number
    sortOrder: number
}

type ProductStyle = {
    id: number
    name: string
    nameZh: string
    sortOrder: number
    items: StyleItem[]
}

const PAGE_SIZE = 12

export default function ProductClient() {
    const { locale } = useLanguage()
    const isZh = locale === 'zh'

    const [styles, setStyles] = useState<ProductStyle[]>([])
    const [activeStyleId, setActiveStyleId] = useState<number | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/product-styles')
            .then(r => r.ok ? r.json() : [])
            .then((data: ProductStyle[]) => {
                setStyles(data)
                if (data.length > 0) setActiveStyleId(data[0].id)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const activeStyle = styles.find(s => s.id === activeStyleId)
    const allItems = activeStyle?.items || []
    const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE))
    const currentItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleStyleChange = (id: number) => {
        setActiveStyleId(id)
        setPage(1)
    }

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <PageBanner
                page="product"
                fallbackTitle={isZh ? '简约而不凡，舒适即是家' : 'Simple yet extraordinary, comfort is home'}
                fallbackDesc={isZh ? '极简设计融合功能美学，打造整洁现代的生活空间' : 'Minimalist design combined with a clean and modern living environment.'}
                fallbackImage="/images/services/hero.png"
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Style Tabs */}
                {!loading && styles.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8">
                        <span className="text-base font-semibold text-gray-600 shrink-0">
                            {isZh ? '产品分类：' : 'Product Type:'}
                        </span>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {styles.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => handleStyleChange(style.id)}
                                        className={`px-4 sm:px-5 py-1.5 text-sm sm:text-base rounded transition-all cursor-pointer ${activeStyleId === style.id
                                            ? 'bg-[#c5a059] text-white font-semibold'
                                            : 'text-gray-700 hover:text-[#c5a059] bg-gray-50 sm:bg-transparent'
                                            }`}
                                    >
                                        {isZh && style.nameZh ? style.nameZh : style.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        {isZh ? '加载中...' : 'Loading...'}
                    </div>
                ) : styles.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        {isZh ? '暂无产品' : 'No products available'}
                    </div>
                ) : currentItems.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        {isZh ? '该分类暂无产品' : 'No products in this category'}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {currentItems.map(item => (
                                <div key={item.id} className="group border border-transparent rounded-xl p-2 pb-3 cursor-pointer transition-all duration-300 hover:border-[#c5a059] hover:shadow-[0_4px_20px_rgba(197,160,89,0.15)]">
                                    <div className="aspect-square max-h-[220px] md:max-h-[280px] mx-auto rounded-lg overflow-hidden bg-gray-50 mb-2">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                                                {isZh ? '暂无图片' : 'No Image'}
                                            </div>
                                        )}
                                    </div>
                                    {item.title && (
                                        <p className="text-xs md:text-sm font-medium text-gray-800 group-hover:text-[#c5a059] text-center mt-1 line-clamp-1 px-1 transition-colors duration-300">
                                            {item.title}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-[#c5a059] hover:text-[#c5a059] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                                    // Show first, last, current ±1, and ellipsis
                                    const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1
                                    const showEllipsisBefore = p === page - 2 && page - 2 > 1
                                    const showEllipsisAfter = p === page + 2 && page + 2 < totalPages
                                    if (!show && !showEllipsisBefore && !showEllipsisAfter) return null
                                    if (showEllipsisBefore || showEllipsisAfter) {
                                        return <span key={`e${p}`} className="text-gray-400 px-1">...</span>
                                    }
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-9 h-9 flex items-center justify-center rounded border text-sm transition-colors cursor-pointer ${page === p
                                                ? 'bg-[#c5a059] text-white border-[#c5a059] font-semibold'
                                                : 'border-gray-200 text-gray-600 hover:border-[#c5a059] hover:text-[#c5a059]'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-[#c5a059] hover:text-[#c5a059] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA Banner */}
            <section className="relative w-full py-12 md:py-20 px-6 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/admin_bg.png" alt="CTA Background" className="object-cover w-full h-full opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h3 className="text-xl md:text-3xl font-serif font-bold mb-6 leading-tight text-white">
                        {isZh ? '请发送您的项目详情，我们将在24小时内与您联系' : 'Please send us your project details. We will contact you within 24 hours.'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 mb-8">
                        {isZh ? '如需快速获取报价，请随时通过 WhatsApp 联系我们：+86 18126679031' : 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at: +86 18126679031.'}
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c5a059] text-black px-8 py-3 rounded-md font-bold hover:bg-white transition-colors duration-300">
                        {isZh ? '联系我们' : 'CONTACT US'}
                    </Link>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}

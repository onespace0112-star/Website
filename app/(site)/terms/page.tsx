'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function TermsPage() {
    const { locale } = useLanguage()
    const isZh = locale === 'zh'
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const lang = isZh ? 'zh' : 'en'
        setLoading(true)
        setNotFound(false)
        setContent('')

        fetch(`/api/legal-documents?type=terms&lang=${lang}`)
            .then(res => {
                if (!res.ok) { setNotFound(true); return null }
                return res.json()
            })
            .then(data => {
                if (data?.content) setContent(data.content)
                else setNotFound(true)
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [isZh])

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <SiteHeader />

            {/* Hero 区域 */}
            <div className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/5 via-transparent to-transparent" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#c5a059]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-6">
                        <svg className="w-4 h-4 text-[#c5a059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        {isZh ? '法律文件' : 'Legal Document'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        {isZh ? '服务条款' : 'Terms of Service'}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {isZh ? '使用我们的服务前请仔细阅读以下条款' : 'Please read these terms carefully before using our services'}
                    </p>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="max-w-4xl mx-auto px-6 pb-20">
                {/* 面包屑 */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-[#c5a059] transition-colors">{isZh ? '首页' : 'Home'}</Link>
                    <span>/</span>
                    <span className="text-gray-300">{isZh ? '服务条款' : 'Terms of Service'}</span>
                </nav>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/10 border-t-[#c5a059] rounded-full animate-spin" />
                        </div>
                    ) : notFound || !content ? (
                        <div className="text-center py-20 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p className="text-lg">{isZh ? '暂未上传服务条款' : 'Terms of Service not available yet'}</p>
                        </div>
                    ) : (
                        <MarkdownRenderer content={content} />
                    )}
                </div>

                {/* 返回按钮 */}
                <div className="mt-8 flex justify-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        {isZh ? '返回登录' : 'Back to Login'}
                    </Link>
                </div>
            </div>

            <SiteFooter />
        </div>
    )
}

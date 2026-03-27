'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <p className="text-[#c5a059] text-xs font-bold uppercase tracking-widest mb-4">Error</p>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">页面加载失败</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm">
                Something went wrong loading this page. Please try again or return home.
            </p>
            <div className="flex items-center gap-3">
                <button
                    onClick={reset}
                    className="px-6 py-2.5 bg-[#c5a059] text-white rounded-lg text-sm font-semibold hover:brightness-95 transition"
                >
                    重试
                </button>
                <Link
                    href="/"
                    className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                    返回首页
                </Link>
            </div>
        </div>
    )
}

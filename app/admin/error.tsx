'use client'

import { useEffect } from 'react'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white border border-slate-200 rounded-2xl px-8 py-8 shadow-sm max-w-sm w-full">
                <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-3">Error</p>
                <h2 className="text-lg font-black text-slate-800 mb-2">页面加载出错</h2>
                <p className="text-slate-400 text-xs mb-6">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <button
                    onClick={reset}
                    className="w-full py-2.5 bg-[#0F172A] text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition"
                >
                    重新加载
                </button>
            </div>
        </div>
    )
}

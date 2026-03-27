'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">出现了一些问题</h2>
                    <p className="text-gray-500 mb-6 text-sm">Something went wrong. Please try again.</p>
                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-[#c5a059] text-white rounded-lg text-sm font-semibold hover:brightness-95 transition"
                    >
                        重试 / Try Again
                    </button>
                </div>
            </body>
        </html>
    )
}

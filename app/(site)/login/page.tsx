'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSiteLogo } from '@/app/actions/getLogo'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()
    const { login } = useAuth()
    const callbackUrl = searchParams.get('callbackUrl') || '/profile'

    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [logo, setLogo] = useState<any>(null)

    useEffect(() => {
        getSiteLogo().then(setLogo)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!identifier || !password) {
            setError(t.auth.errorNamePassword)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.auth.errorLoginFailed)
                return
            }

            if (data?.user) {
                login(data.user)
            }
            router.push(callbackUrl)
        } catch {
            setError(t.auth.errorTryAgain)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center px-8 relative overflow-hidden selection:bg-[#2997ff]/30">
            {/* Background Ambient Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#2997ff]/20 rounded-full blur-[100px] pointer-events-none opacity-50 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#a855f7]/20 rounded-full blur-[100px] pointer-events-none opacity-30" />

            <div className="w-full max-w-sm z-10 mx-auto">
                <div className="mb-12">
                    <Link href="/" className="block mb-8 hover:opacity-80 transition-opacity">
                        {logo ? (
                            <img
                                src={logo.image}
                                alt="ONE SPACE"
                                className="w-[280px] h-[80px] object-contain object-left"
                            />
                        ) : (
                            <img src="/logo.png" alt="ONE SPACE" className="w-[280px] h-[80px] object-contain object-left invert" />
                        )}
                    </Link>
                    <div className="text-left space-y-3">
                        <h1 className="text-4xl font-semibold tracking-tight">{t.auth.welcomeBack}</h1>
                        <p className="text-gray-400 text-base">{t.auth.loginSubtitle}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.account}</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                                placeholder={`${t.auth.email} / ${t.auth.phone}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.password}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                                placeholder={t.auth.password}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#2997ff] to-[#0077ED] text-white py-4 rounded-2xl font-medium text-lg hover:shadow-lg hover:shadow-[#2997ff]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t.profile.loading}</span>
                            </div>
                        ) : t.auth.loginNow}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-5 leading-relaxed">
                    {t.auth.termsAgreement}{' '}
                    <Link href="/terms" className="text-[#2997ff] hover:text-[#5eb1ff] transition-colors">{t.auth.termsOfService}</Link>
                    {' '}{t.auth.and}{' '}
                    <Link href="/privacy" className="text-[#2997ff] hover:text-[#5eb1ff] transition-colors">{t.auth.privacyPolicy}</Link>
                </p>

                <div className="mt-10 space-y-6">
                    <div className="flex items-center justify-between text-sm">
                        <Link href="/reset-password" className="text-gray-500 hover:text-[#2997ff] transition-colors">
                            {t.auth.forgotPassword}
                        </Link>
                        <p className="text-gray-500">
                            {t.auth.noAccount}{' '}
                            <Link
                                href={`/register${callbackUrl !== '/profile' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                                className="text-[#2997ff] hover:text-[#5eb1ff] font-medium transition-colors"
                            >
                                {t.auth.registerNow}
                            </Link>
                        </p>
                    </div>

                    <div className="border-t border-white/[0.08] pt-6 flex justify-start">
                        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {t.auth.backToHome}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const { t } = useLanguage()
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">{t.profile.loading}</div>}>
            <LoginContent />
        </Suspense>
    )
}

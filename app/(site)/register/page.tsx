'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSiteLogo } from '@/app/actions/getLogo'
import { useLanguage } from '@/lib/LanguageContext'
import AreaCodeSelector from '@/components/AreaCodeSelector'

function RegisterContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()
    const callbackUrl = searchParams.get('callbackUrl') || '/profile'

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [usePhone, setUsePhone] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [logo, setLogo] = useState<any>(null)
    const [areaCode, setAreaCode] = useState('')

    useEffect(() => {
        getSiteLogo().then(setLogo)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.password) {
            setError(t.auth.errorPasswordLength)
            return
        }

        if (!form.email && !form.phone) {
            setError(t.auth.errorEmailPhone)
            return
        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError(t.auth.errorEmailFormat)
            return
        }

        if (usePhone) {
            if (!areaCode) {
                setError(t.auth.errorPhoneFormat)
                return
            }
            const fullPhone = `${areaCode}${form.phone}`
            if (!/^\+?[0-9\s-]{8,}$/.test(fullPhone)) {
                setError(t.auth.errorPhoneFormat)
                return
            }
        }

        if (form.password !== form.confirmPassword) {
            setError(t.auth.errorPasswordMatch)
            return
        }

        if (form.password.length < 6) {
            setError(t.auth.errorPasswordLength)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name || undefined,
                    email: !usePhone ? form.email : undefined,
                    phone: usePhone ? `${areaCode}${form.phone}` : undefined,
                    password: form.password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.auth.errorRegistrationFailed)
                return
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
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#2997ff]/20 rounded-full blur-[100px] pointer-events-none opacity-50 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#a855f7]/20 rounded-full blur-[100px] pointer-events-none opacity-30" />

            <div className="w-full max-w-sm z-10 mx-auto">
                <div className="mb-8">
                    <Link href="/" className="block mb-6">
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
                        <h1 className="text-4xl font-semibold tracking-tight">{t.auth.createAccount}</h1>
                        <p className="text-gray-400 text-base">{t.auth.registerSubtitle}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setUsePhone(false)}
                            className={`flex-1 py-2 rounded-xl text-sm ${!usePhone ? 'bg-[#2997ff]' : 'bg-white/10'}`}
                        >
                            {t.auth.byEmail}
                        </button>
                        <button
                            type="button"
                            onClick={() => setUsePhone(true)}
                            className={`flex-1 py-2 rounded-xl text-sm ${usePhone ? 'bg-[#2997ff]' : 'bg-white/10'}`}
                        >
                            {t.auth.byPhone}
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.name}</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                            placeholder={t.auth.placeholderName}
                        />
                    </div>

                    {usePhone ? (
                        <div>
                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.phone}</label>
                            <div className="flex gap-3">
                                <AreaCodeSelector
                                    value={areaCode}
                                    onChange={(value) => setAreaCode(value)}
                                    className="w-[130px] md:w-[150px] flex-shrink-0"
                                    buttonClassName="!bg-white/[0.03] border-white/[0.08] text-white focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] shadow-none rounded-2xl"
                                />
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    disabled={!areaCode}
                                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={areaCode ? t.auth.phone : '请先选择区号'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.email}</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                                placeholder={t.auth.email}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.password}</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                            placeholder={t.auth.password}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.auth.confirmPassword}</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2997ff] focus:bg-white/[0.08] transition-all text-base placeholder:text-gray-600 outline-none"
                            placeholder={t.auth.placeholderConfirm}
                        />
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
                        ) : t.auth.registerNow}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-5 leading-relaxed">
                    {t.auth.termsAgreement}{' '}
                    <Link href="/terms" className="text-[#2997ff] hover:text-[#5eb1ff] transition-colors">{t.auth.termsOfService}</Link>
                    {' '}{t.auth.and}{' '}
                    <Link href="/privacy" className="text-[#2997ff] hover:text-[#5eb1ff] transition-colors">{t.auth.privacyPolicy}</Link>
                </p>

                <p className="text-left mt-8 text-gray-500 text-sm">
                    {t.auth.hasAccount}{' '}
                    <Link
                        href={`/login${callbackUrl !== '/profile' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                        className="text-[#2997ff] hover:text-[#5eb1ff] font-medium transition-colors"
                    >
                        {t.auth.loginNow}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    const { t } = useLanguage()
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">{t.profile.loading}</div>}>
            <RegisterContent />
        </Suspense>
    )
}

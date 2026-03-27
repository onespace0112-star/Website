'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import AreaCodeSelector from '@/components/AreaCodeSelector'
import { Mail, Lock, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
    const router = useRouter()
    const { t } = useLanguage()

    const [tab, setTab] = useState<'email' | 'phone'>('email')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [areaCode, setAreaCode] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [codeSending, setCodeSending] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const target = tab === 'email' ? email : (areaCode ? `${areaCode}${phone}` : phone)

    const handleSendCode = async () => {
        setError('')
        if (tab === 'email' && !email) { setError(t.auth.errorEmailPhone); return }
        if (tab === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t.auth.errorEmailFormat); return }
        if (tab === 'phone' && (!phone || !areaCode)) { setError(t.auth.errorPhoneFormat); return }

        setCodeSending(true)
        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target, type: tab }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || t.auth.errorTryAgain)
                return
            }
            setCountdown(60)
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(timer); return 0 }
                    return prev - 1
                })
            }, 1000)
        } catch {
            setError(t.auth.errorTryAgain)
        } finally {
            setCodeSending(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!target) { setError(t.auth.errorEmailPhone); return }
        if (!code) { setError(t.auth.errorCodeRequired); return }
        if (!newPassword || newPassword.length < 6) { setError(t.auth.errorPasswordLength); return }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target, code, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || t.auth.errorTryAgain)
                return
            }
            setSuccess(t.auth.resetSuccess)
            setTimeout(() => router.push('/login'), 2000)
        } catch {
            setError(t.auth.errorTryAgain)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm p-8 md:p-10">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    {t.auth.resetPassword}
                </h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        type="button"
                        onClick={() => { setTab('email'); setError(''); setSuccess('') }}
                        className={`pb-3 px-1 mr-8 text-sm font-medium transition-colors relative ${tab === 'email' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {t.auth.byEmail}
                        {tab === 'email' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setTab('phone'); setError(''); setSuccess('') }}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${tab === 'phone' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {t.auth.byPhone}
                        {tab === 'phone' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {tab === 'email' ? (
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">{t.auth.email}:</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] transition-all placeholder:text-gray-400"
                                    placeholder={t.auth.placeholderEmail}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">{t.auth.phone}:</label>
                            <div className="flex gap-2">
                                <AreaCodeSelector
                                    value={areaCode}
                                    onChange={setAreaCode}
                                    className="w-[150px] flex-shrink-0"
                                    buttonClassName="!bg-white border-gray-300 text-gray-700 focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] shadow-none rounded-lg !py-2.5"
                                    placeholder={t.auth.countryRegionCode}
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] transition-all placeholder:text-gray-400"
                                    placeholder={t.auth.placeholderPhone}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">{t.auth.verificationCode}:</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] transition-all placeholder:text-gray-400"
                                    placeholder={t.auth.placeholderCode}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={codeSending || countdown > 0}
                                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {countdown > 0 ? `${countdown}s` : t.auth.getCode}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">{t.auth.newPassword}:</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] transition-all placeholder:text-gray-400"
                                placeholder={t.auth.passwordHint}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2.5 rounded-lg">
                            {success}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/login"
                            className="flex-shrink-0 px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                        >
                            {t.auth.back}
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#1890ff] text-white py-3 rounded-lg font-medium text-base hover:bg-[#40a9ff] active:bg-[#096dd9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            ) : t.auth.confirm}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

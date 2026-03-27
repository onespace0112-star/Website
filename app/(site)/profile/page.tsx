'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSiteLogo } from '@/app/actions/getLogo'
import { useLanguage } from '@/lib/LanguageContext'
import SocialLoginButtons from '@/components/SocialLoginButtons'

interface User {
    id: number
    name: string
    email?: string | null
    phone?: string | null
}

interface Chat {
    id: number
    title: string
    createdAt: string
    messages: { content: string }[]
}

export default function ProfilePage() {
    const router = useRouter()
    const { t, locale } = useLanguage()
    const [user, setUser] = useState<User | null>(null)
    const [chats, setChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState(true)
    const [logo, setLogo] = useState<any>(null)
    const [nameDraft, setNameDraft] = useState('')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameError, setNameError] = useState('')

    useEffect(() => {
        getSiteLogo().then(setLogo)
        fetchUser()
        fetchChats()
    }, [])

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/user/me')
            if (!res.ok) {
                router.push('/login')
                return
            }
            const data = await res.json()
            setUser(data.user)
            setNameDraft(data.user?.name || '')
        } catch {
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chat')
            if (res.ok) {
                const data = await res.json()
                setChats(data.chats || [])
            }
        } catch {
            console.error('Failed to fetch chats')
        }
    }

    const handleLogout = async () => {
        await fetch('/api/user/logout', { method: 'POST' })
        router.push('/')
    }

    const handleNameSave = async () => {
        if (!nameDraft.trim()) {
            setNameError(locale === 'zh' ? '名字不能为空' : 'Name is required')
            return
        }
        setNameSaving(true)
        setNameError('')
        try {
            const res = await fetch('/api/user/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameDraft.trim() }),
            })
            const data = await res.json()
            if (!res.ok) {
                setNameError(data.error || (locale === 'zh' ? '保存失败' : 'Failed to save'))
                return
            }
            setUser(data.user)
        } catch {
            setNameError(locale === 'zh' ? '保存失败' : 'Failed to save')
        } finally {
            setNameSaving(false)
        }
    }

    const handleDeleteChat = async (e: React.MouseEvent, chatId: number) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(t.profile.confirmDelete)) return

        await fetch(`/api/chat/${chatId}`, { method: 'DELETE' })
        setChats(chats.filter(c => c.id !== chatId))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm animate-pulse">{t.profile.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#2997ff]/30 overflow-x-hidden relative">
            {/* Background Ambient Glow */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2997ff]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.08]">
                <nav className="w-full h-28 relative text-xs transition-all">
                    <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity">
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-6">
                        <span className="text-gray-500 hidden sm:inline">{user?.name} · {user?.email || user?.phone}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-[11px] font-medium"
                        >
                            {t.profile.logout}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="max-w-[980px] mx-auto px-4 md:px-6 pt-28 md:pt-40 pb-24">
                {/* Hero Section */}
                <div className="mb-16 animate-slide-up-1">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                        {t.profile.welcome}
                        <span className="bg-gradient-to-r from-[#2997ff] to-[#a855f7] bg-clip-text text-transparent">
                            {user?.name}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        {t.profile.subtitle}
                    </p>
                    {(user?.name === 'Guest' || user?.name === user?.email || user?.name === user?.phone) && (
                        <div className="mt-6 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">
                                        {locale === 'zh'
                                            ? '完善姓名可让我们更准确地与您沟通。'
                                            : 'Add your name so we can address you properly.'}
                                    </p>
                                </div>
                                <div className="flex flex-1 items-center gap-3">
                                    <input
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2997ff]"
                                        placeholder={t.auth.placeholderName}
                                    />
                                    <button
                                        onClick={handleNameSave}
                                        disabled={nameSaving}
                                        className="bg-[#2997ff] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0077ED] transition disabled:opacity-50"
                                    >
                                        {nameSaving ? t.profile.loading : (locale === 'zh' ? '保存' : 'Save')}
                                    </button>
                                </div>
                            </div>
                            {nameError && (
                                <p className="text-xs text-red-400 mt-2">{nameError}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1 space-y-6 animate-slide-up-2">
                        <div className="bg-[#1d1d1f] rounded-2xl p-6 border border-white/[0.05]">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.profile.account}</h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">{t.auth.email || 'Email'}</p>
                                    <p className="text-gray-200">{user?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">{t.auth.phone || 'Phone'}</p>
                                    <p className="text-gray-200">{user?.phone || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#2997ff]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
                            <h3 className="font-semibold mb-2">{t.profile.reportTitle}</h3>
                            <p className="text-sm text-gray-400 mb-4">{t.profile.reportDesc}</p>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#2997ff] h-full w-1/3 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="md:col-span-2 animate-slide-up-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">{t.profile.history}</h2>
                            <button
                                onClick={() => router.push('/profile?new=true')}
                                className="text-sm text-[#2997ff] font-medium hover:underline flex items-center gap-1 group"
                            >
                                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {t.profile.newChat}
                            </button>
                        </div>

                        {chats.length === 0 ? (
                            <div className="bg-[#1d1d1f] rounded-3xl p-12 text-center border border-dashed border-white/10">
                                <div className="text-4xl mb-4 opacity-20">💬</div>
                                <p className="text-gray-500 mb-6">{t.profile.noHistory}</p>
                                <button
                                    onClick={() => router.push('/profile?new=true')}
                                    className="bg-[#2997ff] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0077ED] transition shadow-lg shadow-[#2997ff]/20"
                                >
                                    {t.profile.startFirst}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chats.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/profile?chatId=${chat.id}`}
                                        className="block bg-[#1d1d1f] rounded-2xl p-5 border border-white/[0.05] hover:border-[#2997ff]/50 transition-all hover:translate-x-1 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-200 group-hover:text-white transition truncate mb-1">
                                                    {chat.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate line-clamp-1 italic">
                                                    &quot;{chat.messages[0]?.content || '...'}&quot;
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 ml-4">
                                                <span className="text-[10px] text-gray-600 font-mono">
                                                    {new Date(chat.createdAt).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                                    className="text-[10px] text-gray-700 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    {t.profile.delete}
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="max-w-[980px] mx-auto px-6 py-12 border-t border-white/[0.05] text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                    {t.profile.footerTag}
                </p>
                <SocialLoginButtons className="mt-5" />
            </footer>
        </div>
    )
}

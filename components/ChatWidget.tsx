'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Send, X, User, Shield, ExternalLink, PenLine, Sparkles, MessageSquare, QrCode } from 'lucide-react'
import FeedbackModal from './FeedbackModal'

interface Message {
    id: number
    role: 'user' | 'assistant'
    content: string
}

export default function ChatWidget() {
    const CHAT_ENABLED = false
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const { locale, t } = useLanguage()
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [chatId, setChatId] = useState<number | null>(null)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isQrOpen, setIsQrOpen] = useState(false)
    const [isTopVisible, setIsTopVisible] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const isAdminRoute = pathname?.startsWith('/admin')

    useEffect(() => {
        if (!CHAT_ENABLED || isAdminRoute) return
        const id = searchParams.get('chatId')
        const isNew = searchParams.get('new') === 'true'

        if (id) {
            const parsedId = parseInt(id)
            setChatId(parsedId)
            setIsOpen(true)
            fetchChatMessages(parsedId)
        } else if (isNew) {
            setChatId(null)
            setMessages([])
            setIsOpen(true)
        }
    }, [searchParams, isAdminRoute])

    useEffect(() => {
        if (!CHAT_ENABLED || isAdminRoute) return
        if (isOpen) {
            scrollToBottom()
            // Reset unread count when chat is open
            if (unreadCount > 0) {
                setUnreadCount(0)
            }
        } else {
            // Fetch unread count when chat is closed
            fetchUnreadCount()
        }
    }, [messages, isOpen, isAdminRoute])

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/chat/unread')
            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.count)
            }
        } catch (e) {
            console.error('Failed to fetch unread count', e)
        }
    }

    useEffect(() => {
        const onScroll = () => setIsTopVisible(window.scrollY >= 500)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (isAdminRoute) {
        return null
    }

    const fetchChatMessages = async (id: number) => {
        try {
            const res = await fetch(`/api/chat/${id}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.chat.messages || [])
            }
        } catch (e) {
            console.error('Failed to fetch chat messages', e)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return
        if (!user) {
            router.push('/login')
            return
        }

        const userMsg = input.trim()
        setInput('')
        setLoading(true)

        const tempMsgs: Message[] = [...messages, { id: Date.now(), role: 'user', content: userMsg }]
        setMessages(tempMsgs)

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, message: userMsg }),
            })
            const data = await res.json()
            if (res.ok) {
                if (!chatId) setChatId(data.chatId)
                setMessages(prev => [...prev, data.message])
            } else {
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: t.chat.errorBusy }])
            }
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: t.chat.errorNetwork }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="font-sans antialiased">
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                user={user}
            />

            {/* Premium Container for buttons */}
            <div className="fixed z-50 flex flex-col items-center gap-4 right-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] md:right-6 md:bottom-6">
                {/* Back to Top Button */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-[#c5a059] rounded-full shadow-lg flex items-center justify-center text-white hover:brightness-95 hover:scale-110 transition-all duration-500 ease-out ${isTopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                    aria-label="Back to Top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>

                {/* QR Code Scan Button */}
                <div className="relative group">
                    <button
                        onClick={() => setIsQrOpen(v => !v)}
                        className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-[#c5a059] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 flex items-center justify-center hover:brightness-95 hover:scale-110 active:scale-95 transition-all duration-300"
                        aria-label="Scan QR Code"
                    >
                        <QrCode className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                    {/* QR Code Popup — mobile: click toggle, desktop: css hover */}
                    <div className={`absolute right-full bottom-0 mr-4 transition-all duration-300 origin-bottom-right
                        ${isQrOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                        md:opacity-0 md:scale-95 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:pointer-events-auto`}>
                        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 w-[160px] md:w-[180px]">
                            <p className="text-[11px] font-bold text-gray-500 text-center mb-2 uppercase tracking-widest">{locale === 'zh' ? '使用 WhatsApp 进行扫描' : 'Scan with WhatsApp'}</p>
                            <img
                                src="/images/wechat-qr.png"
                                alt="WeChat QR Code"
                                className="w-full aspect-square object-contain rounded-lg"
                            />
                        </div>
                        {/* Arrow */}
                        <div className="absolute right-[-6px] bottom-5 w-3 h-3 bg-white rotate-45 shadow-[2px_-2px_4px_rgba(0,0,0,0.04)]"></div>
                    </div>
                </div>

                {/* WhatsApp Button */}
                <a
                    href="https://api.whatsapp.com/send/?phone=8618126679031&text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%83%B3%E4%BA%86%E8%A7%A3+ONE+SPACE+%E7%9A%84%E9%AB%98%E7%AB%AF%E4%BD%8F%E5%AE%85%E4%BA%A4%E4%BB%98%E6%9C%8D%E5%8A%A1%EF%BC%8C%E8%AF%B7%E4%B8%8E%E6%88%91%E8%81%94%E7%B3%BB%E3%80%82&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-[#c5a059] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 flex items-center justify-center hover:brightness-95 hover:scale-110 active:scale-95 transition-all duration-300 group"
                    aria-label="WhatsApp"
                >
                    <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="absolute right-full mr-4 px-2 py-1 bg-[#0F172A] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase font-bold tracking-[0.2em]">
                        WhatsApp
                    </span>
                </a>

                {/* Feedback Button */}
                <button
                    onClick={() => {
                        // Open feedback modal directly - no login required
                        // FeedbackModal handles both logged-in and anonymous users
                        setIsFeedbackOpen(true)
                    }}
                    className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-[#c5a059] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 flex items-center justify-center hover:brightness-95 hover:scale-110 active:scale-95 transition-all duration-300 group"
                    aria-label="Feedback"
                >
                    <PenLine size={24} className="text-white" />
                    <span className="absolute right-full mr-4 px-2 py-1 bg-[#0F172A] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase font-bold tracking-[0.2em]">
                        {((t.nav as Record<string, string>).feedback) || 'FEEDBACK'}
                    </span>
                </button>

                {CHAT_ENABLED && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] flex items-center justify-center bg-[#c5a059] hover:brightness-95 hover:scale-105 active:scale-95 transition-all duration-300 relative"
                        aria-label={t.chat.title}
                    >
                        {isOpen ? (
                            <X size={24} className="text-white animate-in zoom-in duration-300" />
                        ) : (
                            <>
                                <MessageSquare size={24} className="text-white animate-in zoom-in duration-300" />
                                {unreadCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 border-2 border-white rounded-full text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                ) : (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full opacity-0"></span>
                                )}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Chat Panel - Reimagined with Premium Look */}
            {CHAT_ENABLED && isOpen && (
                <div
                    className="fixed z-50 bg-white overflow-hidden flex flex-col border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-5 fade-in duration-500 left-3 right-3 rounded-2xl bottom-[calc(env(safe-area-inset-bottom)+76px)] h-[min(70dvh,560px)] md:left-auto md:right-6 md:bottom-28 md:w-[380px] md:h-[600px] md:rounded-[32px]"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {/* Header - Gold Gradient but Elegant */}
                    <div className="bg-[#0F172A] p-6 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E2B05E] to-transparent opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#E2B05E]" />
                                    {t.chat.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.chat.subtitle}</p>
                                </div>
                            </div>
                            {user ? (
                                <Link href="/profile" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#E2B05E] transition-colors">
                                    <User size={18} />
                                </Link>
                            ) : (
                                <Link href="/login" className="px-3 py-1.5 bg-[#E2B05E] text-[#0F172A] text-[10px] font-bold rounded-lg hover:brightness-110 transition-all uppercase tracking-widest">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Messages Area - Clean & Spaced */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50">
                        {messages.length === 0 ? (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-[#E2B05E]">
                                    <MessageCircle size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{t.chat.welcome}</h4>
                                    <div className="flex flex-wrap justify-center gap-2 px-6">
                                        {(t.chat.tags || []).map((tag: string) => (
                                            <button
                                                key={tag}
                                                onClick={() => setInput(tag)}
                                                className="text-[11px] font-bold py-2 px-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-full text-slate-500 transition-all shadow-sm hover:translate-y-[-1px]"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[13px] leading-relaxed relative ${msg.role === 'user'
                                        ? 'bg-[#0F172A] text-white shadow-lg'
                                        : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/50 rounded-2xl px-4 py-3 flex gap-1.5 border border-slate-100">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Minimal & Accessible */}
                    <div className="p-4 md:p-6 bg-white border-t border-slate-50">
                        {user ? (
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-[#E2B05E] transition-colors"
                            >
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={t.chat.placeholder}
                                    rows={1}
                                    className="flex-1 bg-transparent px-3 py-2 text-base md:text-[13px] text-slate-700 focus:outline-none resize-none max-h-24"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="w-10 h-10 bg-[#0F172A] flex items-center justify-center rounded-xl text-white hover:bg-[#E2B05E] transition-all disabled:opacity-20 shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        ) : (
                            <div className="text-center p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.chat.loginPrompt}</p>
                                <Link
                                    href="/login"
                                    className="block w-full bg-[#0F172A] text-white py-3 rounded-xl text-[12px] font-bold hover:bg-[#E2B05E] transition-all uppercase tracking-[0.2em]"
                                >
                                    {t.chat.loginBtn}
                                </Link>
                            </div>
                        )}
                        <div className="flex justify-center gap-6 mt-4 opacity-50">
                            <a href="https://wa.me/8618126679031" target="_blank" className="text-[10px] font-black text-slate-500 hover:text-[#25D366] transition-colors uppercase tracking-widest flex items-center gap-1.5">
                                <ExternalLink size={10} />
                                WhatsApp
                            </a>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OS Team AI</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

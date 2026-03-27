'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SocialLoginButtons from '@/components/SocialLoginButtons'

interface Message {
    id: number
    role: 'user' | 'assistant'
    content: string
    createdAt: string
    meta?: {
        needsKnowledge?: boolean
    }
}

interface User {
    id: number
    name: string
}

function ChatContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const chatIdParam = searchParams.get('id')

    const [user, setUser] = useState<User | null>(null)
    const [chatId, setChatId] = useState<number | null>(chatIdParam ? parseInt(chatIdParam) : null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)
    const [isGuest, setIsGuest] = useState(false)
    const [guestRemaining, setGuestRemaining] = useState<number | null>(null)
    const [guestLocked, setGuestLocked] = useState(false)
    const [showSuggestionForm, setShowSuggestionForm] = useState(false)
    const [suggestionForm, setSuggestionForm] = useState({ question: '', suggestedAnswer: '', contact: '' })
    const [suggestionSaving, setSuggestionSaving] = useState(false)
    const [lastUserMessage, setLastUserMessage] = useState('')
    const [showLeadForm, setShowLeadForm] = useState(false)
    const [leadSaving, setLeadSaving] = useState(false)
    const [leadForm, setLeadForm] = useState({
        name: '',
        contact: '',
        intent: '',
        message: '',
        keywords: ''
    })
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const strongKeywords = [
        'budget', 'quote', 'urgent', 'shipping', 'installation', 'payment', 'deposit',
        '预算', '报价', '加急', '物流', '安装', '付款', '定金', '交期', '周期', '时间'
    ]
    const aiGuideKeywords = ['报价', '预算', '交付', '周期', '时间', '付款', 'payment', 'quote', 'budget', 'delivery', 'timeline']
    const [leadTriggered, setLeadTriggered] = useState(false)
    const [leadDismissed, setLeadDismissed] = useState(false)

    const shouldTriggerLead = (userText: string, aiText: string) => {
        if (leadTriggered || leadDismissed) return false
        const lowerUser = userText.toLowerCase()
        const lowerAi = aiText.toLowerCase()
        const userHit = strongKeywords.some(k => lowerUser.includes(k))
        const aiHit = aiGuideKeywords.some(k => lowerAi.includes(k))
        return userHit || aiHit
    }

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if (chatId) {
            fetchChat(chatId)
        }
    }, [chatId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/user/me')
            if (!res.ok) {
                setIsGuest(true)
                return
            }
            const data = await res.json()
            setUser(data.user)
            setIsGuest(false)
        } catch {
            setIsGuest(true)
        } finally {
            setAuthLoading(false)
        }
    }

    const fetchChat = async (id: number) => {
        try {
            const res = await fetch(`/api/chat/${id}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.chat.messages || [])
            }
        } catch {
            console.error('Failed to fetch chat')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return
        if (isGuest && guestLocked) return

        const userMessage = input.trim()
        setInput('')
        setLoading(true)
        setLastUserMessage(userMessage)

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, tempUserMsg])

        try {
            const endpoint = isGuest ? '/api/chat/preview' : '/api/chat/send'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId,
                    message: userMessage,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (isGuest && res.status === 429) {
                    setGuestRemaining(0)
                    setGuestLocked(true)
                }
                throw new Error(data.error)
            }

            if (!isGuest) {
                // Set chatId if new chat
                if (!chatId && data.chatId) {
                    setChatId(data.chatId)
                    // Update URL without reload
                    window.history.pushState({}, '', `/chat?id=${data.chatId}`)
                }
            } else {
                if (typeof data.meta?.remaining === 'number') {
                    setGuestRemaining(data.meta.remaining)
                    if (data.meta.remaining <= 0) setGuestLocked(true)
                }
            }

            // Add AI response
            const aiMessage: Message = {
                ...data.message,
                meta: data.meta || {},
            }
            setMessages(prev => [...prev, aiMessage])

            if (!isGuest && data.meta?.needsKnowledge) {
                setSuggestionForm({
                    question: userMessage,
                    suggestedAnswer: '',
                    contact: user?.name || ''
                })
                setShowSuggestionForm(true)
            }

            if (shouldTriggerLead(userMessage, data.message?.content || '')) {
                setLeadForm({
                    name: user?.name || '',
                    contact: '',
                    intent: '咨询报价/交付',
                    message: userMessage,
                    keywords: strongKeywords.filter(k => userMessage.toLowerCase().includes(k)).join(',')
                })
                setShowLeadForm(true)
                setLeadTriggered(true)
            }
        } catch (error) {
            console.error('Send error:', error)
            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: '抱歉，发送失败。请稍后重试。',
                    createdAt: new Date().toISOString(),
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleSuggestionSubmit = async () => {
        if (!suggestionForm.question.trim()) return
        setSuggestionSaving(true)
        try {
            const res = await fetch('/api/knowledge-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestionForm),
            })
            if (res.ok) {
                setShowSuggestionForm(false)
                setSuggestionForm({ question: '', suggestedAnswer: '', contact: '' })
            }
        } catch (e) {
            console.error('Suggestion submit failed', e)
        } finally {
            setSuggestionSaving(false)
        }
    }

    const handleLeadSubmit = async () => {
        if (!leadForm.contact.trim()) return
        setLeadSaving(true)
        try {
            const res = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadForm),
            })
            if (res.ok) {
                setShowLeadForm(false)
                setLeadForm({ name: '', contact: '', intent: '', message: '', keywords: '' })
            }
        } catch (e) {
            console.error('Lead submit failed', e)
        } finally {
            setLeadSaving(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>加载中...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 py-3 px-6 shrink-0">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <img src="/logo.png" alt="ONE SPACE" className="h-[100px] w-[100px] object-contain invert" />
                        </Link>
                        <span className="text-[#86868b] text-sm">AI 智能客服</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/profile" className="text-[#86868b] hover:text-white transition">
                                {user?.name}
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[#2997ff] hover:underline text-sm">
                                登录 / 注册
                            </Link>
                        )}
                        <Link
                            href="/chat"
                            onClick={() => {
                                setChatId(null)
                                setMessages([])
                            }}
                            className="text-sm text-[#2997ff] hover:underline"
                        >
                            新对话
                        </Link>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    {isGuest && (
                        <div className="mb-4 text-xs text-[#86868b] text-center">
                            游客模式：还可发送 {guestRemaining ?? 5} 条消息。超过后需登录。
                        </div>
                    )}
                    {messages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">💬</div>
                            <h2 className="text-2xl font-semibold mb-2">开始对话</h2>
                            <p className="text-[#86868b] max-w-md mx-auto">
                                我是 ONE SPACE 的智能客服助手。您可以问我关于高端住宅交付、采购、QC、物流等任何问题。
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-[#2997ff] text-white'
                                            : 'bg-[#1d1d1f] text-white'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.meta?.needsKnowledge && (
                                            <button
                                                onClick={() => {
                                                    setSuggestionForm(prev => ({ ...prev, question: prev.question || lastUserMessage || '' }))
                                                    setShowSuggestionForm(true)
                                                }}
                                                className="mt-3 text-xs text-[#2997ff] hover:underline"
                                            >
                                                补充知识库信息
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1d1d1f] rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-[#86868b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            {/* Input */}
            <footer className="border-t border-white/10 py-4 px-6 shrink-0">
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息..."
                            rows={1}
                            className="flex-1 bg-[#1d1d1f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2997ff] resize-none"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading || (isGuest && guestLocked)}
                            className="bg-[#2997ff] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0077ED] transition disabled:opacity-50"
                        >
                            发送
                        </button>
                    </div>
                    {isGuest && guestLocked && (
                        <div className="mt-3 text-center text-xs text-[#86868b]">
                            访客对话已达上限，请
                            <Link href="/login" className="text-[#2997ff] hover:underline mx-1">
                                登录/注册
                            </Link>
                            继续对话。
                        </div>
                    )}
                    <div className="flex justify-center mt-3">
                        <button
                            onClick={() => setShowSuggestionForm(true)}
                            className="text-xs text-[#2997ff] hover:underline"
                        >
                            补充知识库
                        </button>
                    </div>
                    <p className="text-center text-xs text-[#86868b] mt-3">
                        AI 回复仅供参考。如需专业咨询，请联系{' '}
                        <a href="https://wa.me/8618126679031" target="_blank" rel="noopener noreferrer" className="text-[#2997ff]">
                            WhatsApp
                        </a>
                    </p>
                    <SocialLoginButtons className="mt-5" />
                </div>
            </footer>

            {showSuggestionForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 text-black">
                        <h2 className="text-xl font-bold mb-4">补充知识库</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                                <textarea
                                    value={suggestionForm.question}
                                    onChange={(e) => setSuggestionForm({ ...suggestionForm, question: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">建议答案（可选）</label>
                                <textarea
                                    value={suggestionForm.suggestedAnswer}
                                    onChange={(e) => setSuggestionForm({ ...suggestionForm, suggestedAnswer: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={5}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">联系方式（可选）</label>
                                <input
                                    type="text"
                                    value={suggestionForm.contact}
                                    onChange={(e) => setSuggestionForm({ ...suggestionForm, contact: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSuggestionSubmit}
                                    disabled={suggestionSaving}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${suggestionSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {suggestionSaving ? '提交中...' : '提交'}
                                </button>
                                <button
                                    onClick={() => setShowSuggestionForm(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLeadForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 text-black">
                        <h2 className="text-xl font-bold mb-4">快速咨询留资</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">姓名（可选）</label>
                                <input
                                    type="text"
                                    value={leadForm.name}
                                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">联系方式（必填）</label>
                                <input
                                    type="text"
                                    value={leadForm.contact}
                                    onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="WhatsApp / 电话 / 邮箱"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">意向（可选）</label>
                                <input
                                    type="text"
                                    value={leadForm.intent}
                                    onChange={(e) => setLeadForm({ ...leadForm, intent: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="报价 / 安装 / 物流 / 加急"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">补充说明（可选）</label>
                                <textarea
                                    value={leadForm.message}
                                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLeadSubmit}
                                    disabled={leadSaving}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${leadSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {leadSaving ? '提交中...' : '提交'}
                                </button>
                                <button
                                    onClick={() => setShowLeadForm(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLeadForm(false)
                                        setLeadDismissed(true)
                                    }}
                                    className="text-sm text-gray-500"
                                >
                                    本次不再提示
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">加载中...</div>}>
            <ChatContent />
        </Suspense>
    )
}

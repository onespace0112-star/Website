'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuoteModal } from '@/lib/QuoteModalContext'

type KnowledgeItem = {
    id: number
    title: string
    content: string
    category?: string | null
    tags?: string | null
    priority?: number
}

export default function KnowledgeClient() {
    const { openQuoteModal } = useQuoteModal()
    const [items, setItems] = useState<KnowledgeItem[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchItems = async (q: string, cat: string) => {
        setLoading(true)
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (cat) params.set('category', cat)
        const res = await fetch(`/api/knowledge?${params.toString()}`)
        const data = await res.json()
        setItems(data.items || [])
        setCategories(data.categories || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchItems('', '')
    }, [])

    const handleSearch = () => {
        fetchItems(query.trim(), category)
    }

    const handleCategory = (cat: string) => {
        setCategory(cat)
        fetchItems(query.trim(), cat)
    }

    const preview = useMemo(() => {
        return items.map((item) => ({
            ...item,
            snippet: item.content.length > 160 ? `${item.content.slice(0, 160)}...` : item.content
        }))
    }, [items])

    return (
        <div className="min-h-screen bg-[#121212] text-white px-6 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold">Knowledge Base</h1>
                    <p className="text-white/60 mt-2">分类浏览与搜索，快速找到可落地的交付答案。</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索关键字（如：物流 / 预算 / QC）"
                        className="flex-1 bg-[#1d1d1f] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-[#c5a059]"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-[#c5a059] text-black px-6 py-3 rounded-lg font-semibold"
                    >
                        搜索
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => handleCategory('')}
                        className={`px-4 py-2 rounded-full text-sm ${category === '' ? 'bg-[#c5a059] text-black' : 'bg-white/10 text-white/70'}`}
                    >
                        全部
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm ${category === cat ? 'bg-[#c5a059] text-black' : 'bg-white/10 text-white/70'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-white/60">加载中...</div>
                ) : preview.length === 0 ? (
                    <div className="text-white/60">暂无内容</div>
                ) : (
                    <div className="grid gap-6">
                        {preview.map((item) => (
                            <div key={item.id} className="border border-white/10 rounded-2xl p-6 bg-black/40">
                                <div className="flex items-center gap-3 text-sm text-white/50 mb-2">
                                    {item.category && <span>{item.category}</span>}
                                    {item.tags && <span>#{item.tags}</span>}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-white/70 whitespace-pre-wrap">{item.snippet}</p>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={openQuoteModal}
                                        className="bg-[#c5a059] text-black px-4 py-2 rounded-lg text-sm font-semibold"
                                    >
                                        立即咨询
                                    </button>
                                    <Link href="/contact" className="text-[#c5a059] text-sm self-center">预约沟通</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

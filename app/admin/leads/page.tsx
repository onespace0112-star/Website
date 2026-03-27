'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LeadItem {
    id: number
    name?: string | null
    contact?: string | null
    intent?: string | null
    message?: string | null
    keywords?: string | null
    source?: string | null
    createdAt: string
}

export default function AdminLeadsPage() {
    const [items, setItems] = useState<LeadItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/leads')
            if (res.ok) {
                const data = await res.json()
                setItems(data.items || [])
            }
        } catch (e) {
            console.error('Failed to fetch leads', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">聊天留资线索</h1>
            </div>

            {loading ? (
                <p className="text-gray-500">加载中...</p>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                    暂无数据
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="font-semibold">{item.name || '未填写姓名'}</div>
                                    <div className="text-sm text-gray-600 mt-1">联系方式：{item.contact || '-'}</div>
                                    {item.intent && <div className="text-sm text-gray-600 mt-1">意向：{item.intent}</div>}
                                    {item.message && <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{item.message}</div>}
                                    {item.keywords && <div className="text-xs text-gray-500 mt-2">关键词：{item.keywords}</div>}
                                    <div className="text-xs text-gray-400 mt-2">提交时间：{new Date(item.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="text-xs text-gray-400">{item.source || 'chat'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                    ← 返回仪表盘
                </Link>
            </div>
        </div>
    )
}

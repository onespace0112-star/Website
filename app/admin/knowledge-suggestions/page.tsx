'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface KnowledgeSuggestion {
    id: number
    question: string
    suggestedAnswer?: string | null
    contact?: string | null
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    updatedAt: string
}

interface Toast {
    show: boolean
    type: 'success' | 'error'
    message: string
}

export default function AdminKnowledgeSuggestionsPage() {
    const [items, setItems] = useState<KnowledgeSuggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [toast, setToast] = useState<Toast>({ show: false, type: 'success', message: '' })
    const [selected, setSelected] = useState<KnowledgeSuggestion | null>(null)
    const [approveForm, setApproveForm] = useState({ title: '', content: '', category: '', tags: '', priority: 0 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/knowledge-suggestion')
            if (res.ok) {
                const data = await res.json()
                setItems(data.items || [])
            }
        } catch (e) {
            console.error('Failed to fetch suggestions', e)
            showToast('获取数据失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, type, message })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }

    const openApprove = (item: KnowledgeSuggestion) => {
        setSelected(item)
        setApproveForm({
            title: item.question,
            content: item.suggestedAnswer || item.question,
            category: '',
            tags: '',
            priority: 0,
        })
    }

    const handleApprove = async () => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/knowledge-suggestion/${selected.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(approveForm),
            })
            if (res.ok) {
                showToast('审核通过并入库成功', 'success')
                setSelected(null)
                fetchItems()
            } else {
                showToast('审核失败', 'error')
            }
        } catch (e) {
            console.error('Approve failed', e)
            showToast('审核失败', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleReject = async (item: KnowledgeSuggestion) => {
        if (!confirm('确定要拒绝该补充内容吗？')) return
        try {
            const res = await fetch(`/api/admin/knowledge-suggestion/${item.id}/reject`, { method: 'POST' })
            if (res.ok) {
                showToast('已拒绝', 'success')
                fetchItems()
            } else {
                showToast('操作失败', 'error')
            }
        } catch (e) {
            console.error('Reject failed', e)
            showToast('操作失败', 'error')
        }
    }

    const filtered = items.filter(item => filter === 'all' ? true : item.status === filter)

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">知识补全审核</h1>
                <div className="flex items-center gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {status === 'all' ? '全部' : status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500">加载中...</p>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                    暂无数据
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold">问题：</span>
                                        <span>{item.question}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {item.suggestedAnswer || '（未填写建议答案）'}
                                    </div>
                                    {item.contact && (
                                        <div className="text-xs text-gray-500 mt-2">联系方式：{item.contact}</div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-2">提交时间：{new Date(item.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {item.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => openApprove(item)}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                审核通过
                                            </button>
                                            <button
                                                onClick={() => handleReject(item)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                拒绝
                                            </button>
                                        </>
                                    )}
                                    {item.status !== 'pending' && (
                                        <span className={`text-xs px-2 py-1 rounded ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.status === 'approved' ? '已通过' : '已拒绝'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
                        <h2 className="text-xl font-bold mb-4">审核通过并入库</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                                <input
                                    type="text"
                                    value={approveForm.title}
                                    onChange={(e) => setApproveForm({ ...approveForm, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                                <textarea
                                    value={approveForm.content}
                                    onChange={(e) => setApproveForm({ ...approveForm, content: e.target.value })}
                                    rows={8}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                                    <input
                                        type="text"
                                        value={approveForm.category}
                                        onChange={(e) => setApproveForm({ ...approveForm, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                                    <input
                                        type="text"
                                        value={approveForm.tags}
                                        onChange={(e) => setApproveForm({ ...approveForm, tags: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                                    <input
                                        type="number"
                                        value={approveForm.priority}
                                        onChange={(e) => setApproveForm({ ...approveForm, priority: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={saving}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? '提交中...' : '确认入库'}
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in-up">
                    <div className={`${toast.type === 'success' ? 'bg-[#52c41a]' : 'bg-red-500'} text-white px-6 py-3 rounded shadow-lg`}>
                        <span className="font-medium">{toast.message}</span>
                    </div>
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

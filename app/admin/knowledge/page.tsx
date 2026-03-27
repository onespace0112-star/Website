'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface KnowledgeItem {
    id: number
    title: string
    content: string
    category?: string
    tags?: string
    priority?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function AdminKnowledgePage() {
    const [items, setItems] = useState<KnowledgeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<KnowledgeItem | null>(null)
    const [form, setForm] = useState({ title: '', content: '', category: '', tags: '', priority: 0, isActive: true })
    const [showForm, setShowForm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/knowledge')
            if (res.ok) {
                const data = await res.json()
                setItems(data.items || [])
            }
        } catch (e) {
            console.error('Failed to fetch', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const url = '/api/admin/knowledge'
            const method = editing ? 'PUT' : 'POST'
            const body = editing
                ? { id: editing.id, ...form }
                : form

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                await fetchItems()
                if (editing) setEditing(null)
                else setForm({ title: '', content: '', category: '', tags: '', priority: 0, isActive: true })
                setShowForm(false)

                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                setToast({ show: true, type: 'error', message: '保存失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (e) {
            console.error('Save failed', e)
            setToast({ show: true, type: 'error', message: '网络请求错误' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (item: KnowledgeItem) => {
        setEditing(item)
        setForm({
            title: item.title,
            content: item.content,
            category: item.category || '',
            tags: item.tags || '',
            priority: item.priority || 0,
            isActive: item.isActive
        })
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除？')) return

        try {
            const res = await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setItems(items.filter(i => i.id !== id))
                setToast({ show: true, type: 'success', message: '删除成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                setToast({ show: true, type: 'error', message: '删除失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (e) {
            console.error('Delete failed', e)
            setToast({ show: true, type: 'error', message: '删除失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        }
    }

    const handleToggleActive = async (item: KnowledgeItem) => {
        try {
            const res = await fetch('/api/admin/knowledge', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
            })
            if (res.ok) {
                setItems(items.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i))
            }
        } catch (e) {
            console.error('Toggle failed', e)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">知识库管理</h1>
                <button
                    onClick={() => {
                        setEditing(null)
                        setForm({ title: '', content: '', category: '', tags: '', priority: 0, isActive: true })
                        setShowForm(true)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    添加知识
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
                        <h2 className="text-xl font-bold mb-4">
                            {editing ? '编辑知识' : '添加知识'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="知识标题"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={10}
                                    placeholder="知识库内容（AI 将基于这些内容回答问题）"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="如：物流/采购/安装"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                                    <input
                                        type="text"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="用英文逗号分隔"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                                    <input
                                        type="number"
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">启用</label>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <p className="text-gray-500">加载中...</p>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                    <p className="mb-4">暂无知识库内容</p>
                    <p className="text-sm">添加知识后，AI 将基于这些内容回答用户问题</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-lg p-4 ${!item.isActive ? 'opacity-50' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold">{item.title}</h3>
                                        {item.isActive ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">启用</span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">禁用</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                                    {(item.category || item.tags) && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {item.category && <span>分类：{item.category}</span>}
                                            {item.category && item.tags && <span className="mx-2">|</span>}
                                            {item.tags && <span>标签：{item.tags}</span>}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        更新于 {new Date(item.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0 ml-4">
                                    <button
                                        onClick={() => handleToggleActive(item)}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        {item.isActive ? '禁用' : '启用'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Success/Error Toast */}
            {toast.show && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in-up">
                    <div className={`${toast.type === 'success' ? 'bg-[#52c41a]' : 'bg-red-500'} text-white px-6 py-3 rounded shadow-lg flex items-center gap-2`}>
                        {toast.type === 'success' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
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

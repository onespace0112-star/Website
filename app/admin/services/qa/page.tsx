'use client'

import React, { useEffect, useState, useRef } from 'react'

interface QAItem {
    id: number
    title: string
    description: string
    image: string | null
    order: number
    createdAt: string
    updatedAt: string | null
}

export default function QualityAssurancePage() {
    const [items, setItems] = useState<QAItem[]>([])
    const [loading, setLoading] = useState(true)

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentItem, setCurrentItem] = useState<Partial<QAItem>>({})
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/services/qa')
            const data = await res.json()
            if (Array.isArray(data)) setItems(data)
        } catch (err) {
            console.error('Failed to fetch QA items:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const method = currentItem.id ? 'PATCH' : 'POST'
        const url = currentItem.id
            ? `/api/admin/services/qa/${currentItem.id}`
            : '/api/admin/services/qa'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.message || errorData.error || '保存失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (error) {
            console.error('Save error:', error)
            setToast({ show: true, type: 'error', message: '网络请求错误' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            const res = await fetch(`/api/admin/services/qa/${itemToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setItemToDelete(null)
                fetchData()
                setToast({ show: true, type: 'success', message: '删除成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.message || errorData.error || '删除失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (error) {
            console.error('Delete error:', error)
            setToast({ show: true, type: 'error', message: '网络请求错误' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setCurrentItem(prev => ({ ...prev, image: data.url }))
            }
        } catch (err) {
            console.error('Upload failed:', err)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    const normalizeImage = (url?: string | null) => url ? encodeURI(url) : ''

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Header / Add Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => {
                        setCurrentItem({ order: 0 })
                        setShowModal(true)
                    }}
                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors flex items-center gap-1 shadow-sm"
                >
                    <span className="text-lg leading-none pb-0.5">+</span> 添加
                </button>
            </div>

            {/* Table */}
            <div className="border border-gray-300 bg-white rounded-sm overflow-hidden">
                <table className="w-full text-center text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-300 text-gray-700 font-bold">
                        <tr>
                            <th className="px-4 py-3 border-r border-gray-300 w-16">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">质量图片</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">质量标题</th>
                            <th className="px-4 py-3 border-r border-gray-300">质量描述</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-2 py-2 border-r border-gray-200">
                                    {item.image && (
                                        <img
                                            src={normalizeImage(item.image)}
                                            alt="Icon"
                                            className="h-8 w-8 object-contain mx-auto"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{item.title}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600 truncate max-w-xs">{item.description}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {item.updatedAt
                                        ? new Date(item.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
                                        : ''}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => { setCurrentItem(item); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-gray-400">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-[#f0f2f5] w-full max-w-lg shadow-xl overflow-hidden rounded-sm animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-3 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg tracking-wide pl-2">
                                {currentItem.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {/* Title */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">质量标题:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入质量标题"
                                        value={currentItem.title || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">质量图片:</label>
                                <div className="flex-1">
                                    <div
                                        className="w-24 h-24 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] bg-white text-gray-400 hover:text-[#0ea5e9] transition-colors relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {currentItem.image ? (
                                            <img src={currentItem.image} alt="QA" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <>
                                                <span className="text-xl">+</span>
                                                <span className="text-xs">上传</span>
                                            </>
                                        )}
                                        {uploading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">...</div>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">质量描述:</label>
                                <div className="flex-1">
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入质量描述"
                                        value={currentItem.description || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">权重:</label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入权重"
                                        value={currentItem.order || 0}
                                        onChange={e => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-8 py-2 rounded text-sm hover:bg-gray-400 transition-colors font-medium shadow-sm"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`bg-[#0ea5e9] text-white px-8 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors font-medium shadow-md ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                删除该质量保证管理，页面将不再展示此内容，您确定要继续删除吗？
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-6 py-1.5 rounded text-sm hover:bg-gray-400 hover:text-gray-800 transition-colors shadow-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors shadow-md font-medium"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
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
        </div>
    )
}

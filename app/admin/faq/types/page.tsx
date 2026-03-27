'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FAQType {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}

export default function FAQTypesPage() {
    const router = useRouter()
    const [types, setTypes] = useState<FAQType[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [filterName, setFilterName] = useState('')

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentType, setCurrentType] = useState<Partial<FAQType>>({ name: '' })
    const [typeToDelete, setTypeToDelete] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/faq/types')
            const data = await res.json()
            if (Array.isArray(data)) setTypes(data)
        } catch (err) {
            console.error('Failed to fetch types:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const method = currentType.id ? 'PATCH' : 'POST'
        const url = currentType.id
            ? `/api/admin/faq/types/${currentType.id}`
            : '/api/admin/faq/types'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentType)
            })
            if (res.ok) {
                setShowModal(false)

                if (!currentType.id) {
                    // "添加类型保存后回调至常见问题列表"
                    // If it was a new creation (Add), redirect to FAQ list
                    router.push('/admin/faq')
                } else {
                    // If edit, just refresh
                    fetchData()
                }
                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.error || '保存失败' })
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
        setTypeToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!typeToDelete) return
        try {
            const res = await fetch(`/api/admin/faq/types/${typeToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setTypeToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    // Filter Logic
    const filteredTypes = types.filter(t =>
        t.name.toLowerCase().includes(filterName.toLowerCase())
    )

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">


                <button
                    onClick={() => {
                        setCurrentType({ name: '' })
                        setShowModal(true)
                    }}
                    className="ml-auto bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors flex items-center gap-1 shadow-sm"
                >
                    <span className="text-lg leading-none pb-0.5">+</span> 添加
                </button>
            </div>

            {/* Table */}
            <div className="border border-gray-300 bg-white rounded-sm overflow-hidden">
                <table className="w-full text-center text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-300 text-gray-700 font-bold">
                        <tr>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300">问题类型</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">更新时间</th>
                            <th className="px-4 py-3 w-40">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTypes.map((type, index) => (
                            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{type.name}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(type.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(type.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => { setCurrentType(type); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(type.id)}
                                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredTypes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-gray-400">暂无数据</td>
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
                                {currentType.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-700 font-medium text-sm">问题类型:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入问题类型"
                                        value={currentType.name || ''}
                                        onChange={e => setCurrentType({ ...currentType, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 pt-6 pb-2">
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
                                删除该问题类型，FAQ管理后台列表中则不再展示此内容，您确定要继续删除吗？
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

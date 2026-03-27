'use client'

import React, { useEffect, useState } from 'react'
import HeaderManager from '../components/HeaderManager'
import { extractFAQItems, type FAQListItemDTO, type FAQTypeDTO } from '@/lib/dto/faq'

type FAQ = FAQListItemDTO
type FAQType = FAQTypeDTO

function isFAQTypeArray(payload: unknown): payload is FAQType[] {
    return Array.isArray(payload) && payload.every((item) => {
        if (!item || typeof item !== 'object') return false
        const candidate = item as Record<string, unknown>
        return typeof candidate.id === 'number' && typeof candidate.name === 'string'
    })
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [types, setTypes] = useState<FAQType[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [filterQuestion, setFilterQuestion] = useState('')
    const [filterType, setFilterType] = useState('')

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDisableModal, setShowDisableModal] = useState(false)

    // Form states
    const [currentFAQ, setCurrentFAQ] = useState<Partial<FAQ>>({ isActive: true })
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null)
    const [faqToDisable, setFaqToDisable] = useState<FAQ | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [faqsRes, typesRes] = await Promise.all([
                fetch('/api/admin/faq'),
                fetch('/api/admin/faq/types')
            ])
            const [faqsData, typesData] = await Promise.all([
                faqsRes.json(),
                typesRes.json()
            ])

            if (faqsRes.ok) {
                setFaqs(extractFAQItems(faqsData))
            }
            if (typesRes.ok && isFAQTypeArray(typesData)) {
                setTypes(typesData)
            }
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const method = currentFAQ.id ? 'PATCH' : 'POST'
        const url = currentFAQ.id
            ? `/api/admin/faq/${currentFAQ.id}`
            : '/api/admin/faq'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFAQ)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
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
        setFaqToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!faqToDelete) return
        try {
            const res = await fetch(`/api/admin/faq/${faqToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setFaqToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleToggleStatus = (faq: FAQ) => {
        if (faq.isActive) {
            // Turning OFF
            setFaqToDisable(faq)
            setShowDisableModal(true)
        } else {
            // Turning ON - do immediately
            updateStatus(faq.id, true)
        }
    }

    const updateStatus = async (id: number, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/faq/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive })
            })
            if (res.ok) {
                fetchData()
                setShowDisableModal(false)
                setFaqToDisable(null)
            }
        } catch (error) {
            console.error('Update status error:', error)
        }
    }

    // Filter Logic
    const filteredFAQs = faqs.filter(faq => {
        const matchQuestion = faq.question.toLowerCase().includes(filterQuestion.toLowerCase())
        const matchType = filterType ? faq.typeId?.toString() === filterType : true
        return matchQuestion && matchType
    }).sort((a, b) => {
        // First sort by type name
        const typeA = a.type?.name || ''
        const typeB = b.type?.name || ''
        const typeCompare = typeA.localeCompare(typeB)

        // If types are same, sort by id
        if (typeCompare !== 0) return typeCompare
        return a.id - b.id
    })

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <input
                    type="text"
                    placeholder="请输入标题"
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                    value={filterQuestion}
                    onChange={(e) => setFilterQuestion(e.target.value)}
                />
                <div className="relative">
                    <select
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700 appearance-none pr-8"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">请选择问题类型</option>
                        {types.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                <button
                    className="bg-[#d4d4d4] hover:bg-gray-400 text-gray-800 px-6 py-1.5 rounded text-sm transition-colors"
                >
                    搜索
                </button>
                <button
                    className="bg-[#b48b3e] hover:bg-[#9a7633] text-white px-6 py-1.5 rounded text-sm transition-colors"
                    onClick={() => { setFilterQuestion(''); setFilterType(''); }}
                >
                    重置
                </button>

                <button
                    onClick={() => {
                        setCurrentFAQ({ order: 0, isActive: true })
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
                            <th className="px-4 py-3 border-r border-gray-300 w-16">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300">问题类型</th>
                            <th className="px-4 py-3 border-r border-gray-300">标题</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-[400px]">问题答案</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-16">权重</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-20">状态</th>
                            <th className="px-4 py-3 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredFAQs.map((faq, index) => (
                            <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{faq.type?.name || '-'}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{faq.question}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500">
                                    <div className="max-w-[400px] truncate mx-auto" title={faq.answer}>
                                        {faq.answer}
                                    </div>
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{faq.order}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(faq.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(faq.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200">
                                    <button
                                        onClick={() => handleToggleStatus(faq)}
                                        className={`w-10 h-5 rounded-full p-1 transition-colors relative ${faq.isActive ? 'bg-[#4ade80]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${faq.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => { setCurrentFAQ(faq); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(faq.id)}
                                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredFAQs.length === 0 && (
                            <tr>
                                <td colSpan={9} className="py-8 text-gray-400">暂无数据</td>
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
                                {currentFAQ.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {/* Type */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">问题类型:</label>
                                <div className="flex-1 relative">
                                    <select
                                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] appearance-none"
                                        value={currentFAQ.typeId || ''}
                                        onChange={e => setCurrentFAQ({ ...currentFAQ, typeId: parseInt(e.target.value) })}
                                    >
                                        <option value="">请选择问题类型</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">标题:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入标题"
                                        value={currentFAQ.question || ''}
                                        onChange={e => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Answer */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">问题答案:</label>
                                <div className="flex-1">
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        value={currentFAQ.answer || ''}
                                        onChange={e => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Order */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">权重:</label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入权重"
                                        value={currentFAQ.order || 0}
                                        onChange={e => setCurrentFAQ({ ...currentFAQ, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">状态:</label>
                                <div className="flex-1 flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={currentFAQ.isActive === true}
                                            onChange={() => setCurrentFAQ({ ...currentFAQ, isActive: true })}
                                            className="accent-[#0ea5e9]"
                                        />
                                        <span className="text-sm text-gray-700">启用</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={currentFAQ.isActive === false}
                                            onChange={() => setCurrentFAQ({ ...currentFAQ, isActive: false })}
                                            className="accent-[#0ea5e9]"
                                        />
                                        <span className="text-sm text-gray-700">禁用</span>
                                    </label>
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
                                删除该问题，页面将不再展示此内容，您确定要继续删除吗？
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

            {/* Disable Confirmation Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setShowDisableModal(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                禁用该问题后，页面将不再展示此内容，您确定要继续禁用吗？
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowDisableModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-6 py-1.5 rounded text-sm hover:bg-gray-400 hover:text-gray-800 transition-colors shadow-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => faqToDisable && updateStatus(faqToDisable.id, false)}
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

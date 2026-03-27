'use client'

import React, { useEffect, useState } from 'react'

interface QuestionItem {
    id: number
    name: string | null
    email: string | null
    phone: string | null
    question: string
    createdAt: string
}

export default function FAQQuestionsPage() {
    const [items, setItems] = useState<QuestionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null })
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/faq/questions', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to fetch questions:', err)
        } finally {
            setLoading(false)
        }
    }

    const openDeleteModal = (id: number) => {
        setDeleteModal({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (!deleteModal.id) return
        try {
            const res = await fetch(`/api/admin/faq/questions?id=${deleteModal.id}`, { method: 'DELETE' })
            if (res.ok) {
                setItems(items.filter(i => i.id !== deleteModal.id))
                setDeleteModal({ isOpen: false, id: null })
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

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">问题管理</h1>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow-sm border border-gray-100">共 {items.length} 条</span>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">序号</th>
                            <th className="px-6 py-4">名字</th>
                            <th className="px-6 py-4">邮箱/手机号</th>
                            <th className="px-6 py-4">顾虑问题</th>
                            <th className="px-6 py-4">提交时间</th>
                            <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">加载中...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">暂无数据</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-800">{item.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.email || item.phone || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.question}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => openDeleteModal(item.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors py-1 px-3 hover:bg-red-50 rounded"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                确定删除该问题？删除后不可恢复。
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null })}
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

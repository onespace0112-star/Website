'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, X, Upload, Loader2, Edit, Trash2 } from 'lucide-react'
import ImageUpload from '@/app/admin/components/ImageUpload'

interface CarouselItem {
    id: number
    title: string | null
    image: string
    order: number
    isVisible: boolean
    height: number
}

export default function CarouselPage() {
    const [items, setItems] = useState<CarouselItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        order: 0,
        height: 800,
        isVisible: true
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        type: 'delete' | 'hide' | 'show' | null
        ids: number[]
        title: string
    }>({
        isOpen: false,
        type: null,
        ids: [],
        title: ''
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/carousel')
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (error) {
            console.error('Failed to fetch items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(items.map(i => i.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const openAddModal = () => {
        setEditingId(null)
        setFormData({ title: '', image: '', order: 0, height: 800, isVisible: true })
        setIsModalOpen(true)
    }

    const openEditModal = (item: CarouselItem) => {
        setEditingId(item.id)
        setFormData({
            title: item.title || '',
            image: item.image,
            order: item.order,
            height: item.height || 800,
            isVisible: item.isVisible
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.image) {
            setToast({ show: true, type: 'error', message: '请上传图片' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            return
        }

        setIsSubmitting(true)
        try {
            const url = editingId ? `/api/admin/carousel/${editingId}` : '/api/admin/carousel'
            const method = editingId ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchItems()
                setToast({ show: true, type: 'success', message: '操作成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.details || errorData.error || '操作失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (error) {
            console.error(error)
            setToast({ show: true, type: 'error', message: '操作出错' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAction = async () => {
        const { type, ids } = confirmModal
        if (!type || ids.length === 0) return

        try {
            if (type === 'delete') {
                for (const id of ids) {
                    await fetch(`/api/admin/carousel/${id}`, { method: 'DELETE' })
                }
            } else {
                const isVisible = type === 'show'
                for (const id of ids) {
                    await fetch(`/api/admin/carousel/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isVisible })
                    })
                }
            }
            fetchItems()
            setSelectedIds([])
            setConfirmModal({ ...confirmModal, isOpen: false })
            setToast({ show: true, type: 'success', message: '批量操作成功' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
        } catch (error) {
            setToast({ show: true, type: 'error', message: '操作失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        }
    }

    const openConfirm = (type: 'delete' | 'hide' | 'show', ids?: number[]) => {
        const targetIds = ids || selectedIds
        if (targetIds.length === 0) {
            return alert('您未选择任何轮播图')
        }

        let title = ''
        switch (type) {
            case 'delete': title = '删除'; break;
            case 'hide': title = '隐藏'; break;
            case 'show': title = '显示'; break;
        }

        setConfirmModal({
            isOpen: true,
            type,
            ids: targetIds,
            title: `您确定要${title}此轮播图吗？`
        })
    }

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            <h1 className="text-2xl font-bold text-gray-800">轮播图管理</h1>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                <button
                    onClick={openAddModal}
                    className="bg-[#0ea5e9] text-white px-6 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                    <Plus size={16} /> 新增轮播图
                </button>
                <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                <button
                    onClick={() => openConfirm('show')}
                    className="bg-white text-[#0ea5e9] border border-[#0ea5e9] px-4 py-2 rounded text-sm hover:bg-[#0ea5e9]/5 transition-colors font-medium"
                >
                    批量显示
                </button>
                <button
                    onClick={() => openConfirm('hide')}
                    className="bg-white text-orange-500 border border-orange-500 px-4 py-2 rounded text-sm hover:bg-orange-50 transition-colors font-medium"
                >
                    批量隐藏
                </button>
                <button
                    onClick={() => openConfirm('delete')}
                    className="bg-white text-red-500 border border-red-500 px-4 py-2 rounded text-sm hover:bg-red-50 transition-colors font-medium ml-auto"
                >
                    批量删除
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="w-16 px-4 py-4 text-center">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={items.length > 0 && selectedIds.length === items.length}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-4 py-4">轮播图片</th>
                            <th className="px-4 py-4">标题</th>
                            <th className="px-4 py-4 text-center w-24">高</th>
                            <th className="px-4 py-4 text-center w-24">权重</th>
                            <th className="px-4 py-4 text-center w-24">状态</th>
                            <th className="px-4 py-4 text-center w-36">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">加载中...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">暂无数据</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="w-32 h-16 relative bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                            <Image src={item.image} alt={item.title || 'carousel'} fill className="object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-800">{item.title || '-'}</td>
                                    <td className="px-4 py-4 text-center text-gray-600">{item.height || 800}</td>
                                    <td className="px-4 py-4 text-center text-gray-600">{item.order}</td>
                                    <td className="px-4 py-4 text-center">
                                        {item.isVisible ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                显示
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                隐藏
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                                                title="编辑"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => openConfirm('delete', [item.id])}
                                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="删除"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? '编辑轮播图' : '添加轮播图'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">标题 (可选)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="请输入轮播图标题"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        轮播图片 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">建议尺寸: 1920x800px，小于 2MB</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">权重</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-gray-400">数字越小越靠前</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">高度 (px)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) || 800 })}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">状态</label>
                                        <div className="flex gap-6 mt-3">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.isVisible ? 'border-blue-500' : 'border-gray-300'}`}>
                                                    {formData.isVisible && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={formData.isVisible === true}
                                                    onChange={() => setFormData({ ...formData, isVisible: true })}
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">显示</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.isVisible === false ? 'border-blue-500' : 'border-gray-300'}`}>
                                                    {formData.isVisible === false && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={formData.isVisible === false}
                                                    onChange={() => setFormData({ ...formData, isVisible: false })}
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">隐藏</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-[#0EA5E9] text-white rounded-md hover:bg-sky-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        {isSubmitting ? '提交中...' : '确定'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl p-6 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${confirmModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {confirmModal.type === 'delete' ? <Trash2 size={24} /> : <Loader2 size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {confirmModal.type === 'delete' ? '确认删除' : (confirmModal.type === 'hide' ? '确认隐藏' : '确认显示')}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">此操作不可撤销，请谨慎操作。</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-8 py-2 border-y border-gray-100 bg-gray-50 px-3 rounded text-sm text-center">
                            {confirmModal.title}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAction}
                                className={`px-4 py-2 rounded text-white text-sm font-medium ${confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}
                            >
                                确定
                            </button>
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

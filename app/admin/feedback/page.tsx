'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, X, Loader2 } from 'lucide-react'

type IssueType = {
    id: number
    name: string
}

type FeedbackItem = {
    id: number
    typeId: number | null
    type?: IssueType
    customerName: string
    contact: string
    description: string
    images: string // JSON string
    status: string
    createdAt: string
}

export default function FeedbackListPage() {
    const [items, setItems] = useState<FeedbackItem[]>([])
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingItem, setDeletingItem] = useState<FeedbackItem | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [viewingImage, setViewingImage] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/feedback')
            if (response.ok) {
                setItems(await response.json())
            }
        } catch (error) {
            alert('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingItem) return
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/feedback/${deletingItem.id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed')

            setIsDeleteModalOpen(false)
            fetchData()
            setDeletingItem(null)
        } catch (error) {
            alert('删除失败')
        } finally {
            setIsSubmitting(false)
        }
    }

    const openDeleteModal = (item: FeedbackItem) => {
        setDeletingItem(item)
        setIsDeleteModalOpen(true)
    }

    const parseImages = (jsonImages: string | null) => {
        if (!jsonImages) return []
        try {
            return JSON.parse(jsonImages)
        } catch (e) {
            return []
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/\//g, '-')
    }

    const formatContact = (contact: string) => {
        if (!contact) return <span className="text-gray-300">-</span>
        if (contact.startsWith('+86')) {
            const rest = contact.slice(3)
            return (
                <span>
                    <span className="mr-[3px]">+86</span>
                    {rest}
                </span>
            )
        }
        return contact
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">反馈管理</h1>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">共 {items.length} 条记录</div>
                    <Link
                        href="/admin/feedback/types"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1890ff] hover:bg-[#40a9ff] text-white text-sm transition-colors"
                    >
                        <Plus size={14} />
                        反馈问题类型
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 w-20 text-center">序号</th>
                            <th className="py-4 px-6 max-w-[200px]">邮箱/手机</th>
                            <th className="py-4 px-6 w-32">类型</th>
                            <th className="py-4 px-6 w-32 text-center">图片</th>
                            <th className="py-4 px-6">描述</th>
                            <th className="py-4 px-6 w-48">创建时间</th>
                            <th className="py-4 px-6 w-24 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-12">
                                    <div className="flex justify-center">
                                        <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">暂无反馈数据</td>
                            </tr>
                        ) : (
                            items.map((item, index) => {
                                const images = parseImages(item.images)
                                return (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-200 bg-white">
                                        <td className="py-4 px-6 text-center text-gray-400">{index + 1}</td>
                                        <td className="py-4 px-6 font-medium text-gray-700 truncate" title={item.contact}>
                                            {formatContact(item.contact)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.type?.name || '其他'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {images.length > 0 ? (
                                                <div className="flex justify-center">
                                                    <img
                                                        src={images[0]}
                                                        alt="Feedback"
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm hover:scale-110 transition-transform cursor-zoom-in bg-gray-50"
                                                        onClick={() => setViewingImage(images[0])}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center text-gray-300">-</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <p className="line-clamp-2 max-w-md" title={item.description}>
                                                {item.description || <span className="text-gray-300">-</span>}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 tabular-nums">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h3 className="font-semibold text-lg text-gray-800">确认删除</h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={24} className="text-red-500" />
                            </div>
                            <p className="text-gray-600 text-base">
                                您确定要删除该条问题反馈吗？<br />
                                <span className="text-xs text-gray-400 mt-1 block">此操作无法撤销</span>
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50/50 px-6 py-4 flex justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm shadow-red-500/20 disabled:opacity-50"
                            >
                                {isSubmitting ? '删除中...' : '确认删除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {viewingImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
                    onClick={() => setViewingImage(null)}
                >
                    <button
                        onClick={() => setViewingImage(null)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={viewingImage}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-up cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}

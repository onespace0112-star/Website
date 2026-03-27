'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Loader2, Edit3, Trash2 } from 'lucide-react'


type IssueType = {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}

export default function FeedbackTypesPage() {
    const [types, setTypes] = useState<IssueType[]>([])
    const [loading, setLoading] = useState(true)

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingType, setEditingType] = useState<IssueType | null>(null)
    const [deletingType, setDeletingType] = useState<IssueType | null>(null)

    // Form states
    const [formData, setFormData] = useState({ name: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchTypes()
    }, [])

    const fetchTypes = async () => {
        try {
            const response = await fetch('/api/feedback/types')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setTypes(data)
        } catch (error) {
            alert('获取列表失败')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('请输入问题类型')
            return
        }

        setIsSubmitting(true)
        try {
            const url = editingType
                ? `/api/feedback/types/${editingType.id}`
                : '/api/feedback/types'

            const method = editingType ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Operation failed')
            }

            alert(editingType ? '更新成功' : '添加成功')
            setIsAddModalOpen(false)
            fetchTypes()
            resetForm()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingType) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/feedback/types/${deletingType.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Delete failed')

            alert('删除成功')
            setIsDeleteModalOpen(false)
            fetchTypes()
            setDeletingType(null)
        } catch (error) {
            alert('删除失败')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: '' })
        setEditingType(null)
    }

    const openAddModal = () => {
        resetForm()
        setIsAddModalOpen(true)
    }

    const openEditModal = (type: IssueType) => {
        setEditingType(type)
        setFormData({ name: type.name })
        setIsAddModalOpen(true)
    }

    const openDeleteModal = (type: IssueType) => {
        setDeletingType(type)
        setIsDeleteModalOpen(true)
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

    return (
        <div className="p-6 max-w-[1200px] mx-auto">
            {/* Header with Add Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-1 bg-[#1890ff] hover:bg-[#40a9ff] text-white px-4 py-2 rounded text-sm transition-colors"
                >
                    <Plus size={16} />
                    <span>添加</span>
                </button>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-sm">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th className="py-3 px-4 border-b border-r border-gray-200 w-24">序号</th>
                            <th className="py-3 px-4 border-b border-r border-gray-200">问题类型</th>
                            <th className="py-3 px-4 border-b border-r border-gray-200 w-48">创建时间</th>
                            <th className="py-3 px-4 border-b border-r border-gray-200 w-48">更新时间</th>
                            <th className="py-3 px-4 border-b border-gray-200 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-8">
                                    <div className="flex justify-center">
                                        <Loader2 className="animate-spin text-gray-400" />
                                    </div>
                                </td>
                            </tr>
                        ) : types.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-gray-400">暂无数据</td>
                            </tr>
                        ) : (
                            types.map((type, index) => (
                                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 border-b border-r border-gray-100">{index + 1}</td>
                                    <td className="py-3 px-4 border-b border-r border-gray-100">{type.name}</td>
                                    <td className="py-3 px-4 border-b border-r border-gray-100">{formatDate(type.createdAt)}</td>
                                    <td className="py-3 px-4 border-b border-r border-gray-100">{formatDate(type.updatedAt)}</td>
                                    <td className="py-3 px-4 border-b border-gray-100 border-r-0">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(type)}
                                                className="text-[#1890ff] hover:text-[#40a9ff] transition-colors"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(type)}
                                                className="text-[#ff4d4f] hover:text-[#ff7875] transition-colors"
                                            >
                                                删除
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
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#f0f2f5] rounded-lg shadow-xl w-full max-w-[500px] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#00a0e9] px-4 py-3 flex justify-between items-center text-white">
                            <h3 className="font-medium text-lg">{editingType ? '编辑' : '添加'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-white/20 rounded p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="flex items-center gap-4">
                                <label className="text-gray-700 whitespace-nowrap w-20 text-right">问题类型：</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="请输入问题类型"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#00a0e9] transition-colors bg-white"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 flex justify-center gap-4">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-8 py-2 bg-[#d9d9d9] hover:bg-[#cfcfcf] text-gray-700 rounded transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-2 bg-[#00a0e9] hover:bg-[#0090d9] text-white rounded transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#f0f2f5] rounded-lg shadow-xl w-full max-w-[500px] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#00a0e9] px-4 py-3 flex justify-between items-center text-white">
                            <h3 className="font-medium text-lg">提示</h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="hover:bg-white/20 rounded p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 text-center">
                            <p className="text-gray-600 leading-relaxed">
                                删除该问题类型，反馈列表管理将不再展示此问题类型，<br />
                                您确定要继续删除吗？
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 flex justify-center gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-8 py-2 bg-[#d9d9d9] hover:bg-[#cfcfcf] text-gray-700 rounded transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="px-8 py-2 bg-[#00a0e9] hover:bg-[#0090d9] text-white rounded transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? '删除中...' : '确定'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

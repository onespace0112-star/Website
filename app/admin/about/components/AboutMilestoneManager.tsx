'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Save } from 'lucide-react'
import ImageUpload from '@/app/admin/components/ImageUpload'

type Milestone = {
    id: number
    image: string | null
    imageZh: string | null
    description: string
    descriptionZh: string | null
    order: number
}

export default function AboutMilestoneManager() {
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Milestone | null>(null)
    const [formData, setFormData] = useState({
        image: '',
        imageZh: '',
        description: '',
        descriptionZh: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/about/milestone')
            const data = await res.json()
            if (Array.isArray(data)) {
                setMilestones(data)
            }
        } catch (error) {
            console.error('Failed to fetch milestones:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = '/api/admin/about/milestone'
            const method = editingItem ? 'PUT' : 'POST'
            const body = editingItem ? { ...formData, id: editingItem.id } : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingItem(null)
                setFormData({ image: '', imageZh: '', description: '', descriptionZh: '' })
                fetchData()
            } else {
                const errorData = await res.json()
                alert(`保存失败: ${errorData.error || '未知错误'}`)
            }
        } catch (error) {
            console.error('Failed to save milestone:', error)
            alert('保存失败，请检查网络或重试')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const res = await fetch(`/api/admin/about/milestone?id=${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to delete milestone:', error)
        }
    }

    const openEdit = (item: Milestone) => {
        setEditingItem(item)
        setFormData({
            image: item.image || '',
            imageZh: item.imageZh || '',
            description: item.description,
            descriptionZh: item.descriptionZh || ''
        })
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">发展里程管理</h2>
                <button
                    onClick={() => {
                        setEditingItem(null)
                        setFormData({ image: '', imageZh: '', description: '', descriptionZh: '' })
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                    <Plus size={18} />
                    添加里程碑
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图片 (EN)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图片 (中)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {milestones.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.image ? (
                                        <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden">
                                            <img src={item.image} alt="" className="object-cover w-full h-full" />
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">无图片</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.imageZh ? (
                                        <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden">
                                            <img src={item.imageZh} alt="" className="object-cover w-full h-full" />
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">无图片</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xl truncate">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {milestones.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    暂无数据，请添加。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold">
                                {editingItem ? '编辑里程碑' : '添加里程碑'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">图片 (EN/默认)</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">图片 (中)</label>
                                <ImageUpload
                                    value={formData.imageZh}
                                    onChange={(url) => setFormData({ ...formData, imageZh: url })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                                    rows={5}
                                    required
                                    placeholder="例如：2016 Export furniture to 12 countries"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (中文)</label>
                                <textarea
                                    value={formData.descriptionZh}
                                    onChange={(e) => setFormData({ ...formData, descriptionZh: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                                    rows={5}
                                    placeholder="可选，例如：2016年 出口家具到12个国家"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border rounded-md"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

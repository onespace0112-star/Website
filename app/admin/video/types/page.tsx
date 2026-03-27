'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface VideoTypeItem {
    id: number
    name: string
    order: number
    createdAt: string
    updatedAt: string
}

export default function VideoTypesPage() {
    const [items, setItems] = useState<VideoTypeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<VideoTypeItem | null>(null)
    const [form, setForm] = useState<{ name: string; order: number }>({ name: '', order: 0 })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/video/types')
            if (res.ok) {
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error('Failed to fetch video types', e)
        } finally {
            setLoading(false)
        }
    }

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', order: 0 })
        setShowModal(true)
    }

    const openEdit = (item: VideoTypeItem) => {
        setEditing(item)
        setForm({ name: item.name || '', order: item.order || 0 })
        setShowModal(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { ...form }
        try {
            if (editing) {
                await fetch(`/api/admin/video/types/${editing.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                await fetch('/api/admin/video/types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }
            setShowModal(false)
            fetchData()
        } catch (e) {
            console.error('Save failed', e)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该视频类型？')) return
        try {
            await fetch(`/api/admin/video/types/${id}`, { method: 'DELETE' })
            fetchData()
        } catch (e) {
            console.error('Delete failed', e)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">视频类型管理</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    新增
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-16">序号</th>
                            <th className="px-6 py-4">类型名称</th>
                            <th className="px-6 py-4">权重</th>
                            <th className="px-6 py-4">创建时间</th>
                            <th className="px-6 py-4">更新时间</th>
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
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500 text-xs">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-800">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{item.order}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(item.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="p-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10 rounded"
                                                title="编辑"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                title="删除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800">{editing ? '编辑类型' : '新增类型'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">类型名称</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">权重</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm bg-gray-100 rounded">取消</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-[#0ea5e9] text-white rounded">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

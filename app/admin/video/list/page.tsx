'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface VideoTypeItem {
    id: number
    name: string
}

interface VideoItem {
    id: number
    title: string
    videoUrl: string | null
    coverImage: string | null
    order: number
    createdAt: string
    updatedAt: string
    typeId: number | null
    type?: VideoTypeItem | null
}

export default function VideoListPage() {
    const [items, setItems] = useState<VideoItem[]>([])
    const [types, setTypes] = useState<VideoTypeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<VideoItem | null>(null)
    const [uploading, setUploading] = useState(false)
    const [coverUploading, setCoverUploading] = useState(false)
    const [form, setForm] = useState<{ title: string; videoUrl: string; coverImage: string; order: number; typeId: number | '' }>({
        title: '',
        videoUrl: '',
        coverImage: '',
        order: 0,
        typeId: ''
    })

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [listRes, typeRes] = await Promise.all([
                fetch('/api/admin/video/list'),
                fetch('/api/admin/video/types')
            ])
            if (typeRes.ok) {
                const t = await typeRes.json()
                setTypes(Array.isArray(t) ? t : [])
            }
            if (listRes.ok) {
                const data = await listRes.json()
                setItems(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error('Failed to fetch videos', e)
        } finally {
            setLoading(false)
        }
    }

    const openCreate = () => {
        setEditing(null)
        setForm({ title: '', videoUrl: '', coverImage: '', order: 0, typeId: '' })
        setShowModal(true)
    }

    const openEdit = (item: VideoItem) => {
        setEditing(item)
        setForm({
            title: item.title || '',
            videoUrl: item.videoUrl || '',
            coverImage: item.coverImage || '',
            order: item.order || 0,
            typeId: item.typeId || ''
        })
        setShowModal(true)
    }

    const handleUpload = async (file: File) => {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            if (res.ok) {
                const data = await res.json()
                // 自动使用 ffmpeg 生成的封面（如果有）
                setForm(prev => ({
                    ...prev,
                    videoUrl: data.url,
                    // 如果返回了封面 URL 且当前没有封面，则自动使用
                    coverImage: data.coverUrl && !prev.coverImage ? data.coverUrl : prev.coverImage
                }))
            } else {
                alert('上传失败')
            }
        } catch (e) {
            console.error('Upload failed', e)
            alert('上传失败')
        } finally {
            setUploading(false)
        }
    }

    const handleCoverUpload = async (file: File) => {
        setCoverUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            if (res.ok) {
                const data = await res.json()
                setForm(prev => ({ ...prev, coverImage: data.url }))
            } else {
                alert('封面上传失败')
            }
        } catch (e) {
            console.error('Cover upload failed', e)
            alert('封面上传失败')
        } finally {
            setCoverUploading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            title: form.title,
            videoUrl: form.videoUrl,
            coverImage: form.coverImage,
            order: form.order,
            typeId: form.typeId === '' ? null : Number(form.typeId)
        }
        try {
            let res
            if (editing) {
                res = await fetch(`/api/admin/video/list/${editing.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                res = await fetch('/api/admin/video/list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            if (!res || !res.ok) {
                const errorData = await res?.json().catch(() => ({}))
                throw new Error(errorData?.error || '操作失败，请重试')
            }

            setShowModal(false)
            fetchAll()
        } catch (e: any) {
            console.error('Save failed', e)
            alert(`保存失败: ${e.message}`)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该视频？')) return
        try {
            await fetch(`/api/admin/video/list/${id}`, { method: 'DELETE' })
            fetchAll()
        } catch (e) {
            console.error('Delete failed', e)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">视频列表管理</h1>
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
                            <th className="px-6 py-4">视频类型</th>
                            <th className="px-6 py-4">标题</th>
                            <th className="px-6 py-4">封面</th>
                            <th className="px-6 py-4">视频</th>
                            <th className="px-6 py-4">权重</th>
                            <th className="px-6 py-4">创建时间</th>
                            <th className="px-6 py-4">更新时间</th>
                            <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-400">加载中...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-400">暂无数据</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500 text-xs">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-700 text-xs">{item.type?.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-800">{item.title}</td>
                                    <td className="px-6 py-4">
                                        {item.coverImage ? (
                                            <img src={item.coverImage} className="w-16 h-10 object-cover rounded bg-gray-100" alt="cover" />
                                        ) : <span className="text-gray-300 text-xs">无</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.videoUrl ? (
                                            <video
                                                src={item.videoUrl}
                                                className="w-24 h-14 rounded object-cover bg-black/80"
                                                controls
                                                // @ts-ignore
                                                poster={item.coverImage || undefined}
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">无</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{item.order}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{item.updatedAt ? new Date(item.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') : '-'}</td>
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
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#3b82f6]">
                            <h3 className="font-semibold text-white">{editing ? '编辑' : '添加'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600 text-right">视频类型：</label>
                                <select
                                    value={form.typeId}
                                    onChange={(e) => setForm({ ...form, typeId: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                >
                                    <option value="">请选择视频类型</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600 text-right">标题：</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    placeholder="请输入标题"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                                <label className="text-sm text-gray-600 text-right pt-2">封面图：</label>
                                <div className="space-y-2">
                                    {!form.coverImage ? (
                                        <label className="inline-flex h-24 w-24 items-center justify-center rounded border border-gray-300 text-gray-500 cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleCoverUpload(file)
                                                }}
                                            />
                                            <div className="flex flex-col items-center text-xs">
                                                <span className="text-2xl leading-none">+</span>
                                                <span>上传封面</span>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="space-y-2">
                                            <img src={form.coverImage} className="w-40 h-24 rounded object-cover border" alt="cover" />
                                            <div className="flex gap-2">
                                                <label className="inline-flex items-center gap-2 text-xs text-[#0ea5e9] cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleCoverUpload(file)
                                                        }}
                                                    />
                                                    更换封面
                                                </label>
                                                <button type="button" onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))} className="text-xs text-red-500">清除</button>
                                            </div>
                                        </div>
                                    )}
                                    {coverUploading && <div className="text-xs text-gray-400">上传中...</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                                <label className="text-sm text-gray-600 text-right pt-2">视频：</label>
                                <div className="space-y-2">
                                    {!form.videoUrl ? (
                                        <label className="inline-flex h-24 w-24 items-center justify-center rounded border border-gray-300 text-gray-500 cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleUpload(file)
                                                }}
                                            />
                                            <div className="flex flex-col items-center text-xs">
                                                <span className="text-2xl leading-none">+</span>
                                                <span>上传视频</span>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="space-y-2">
                                            <video
                                                src={form.videoUrl}
                                                className="w-40 h-24 rounded object-cover bg-black/80"
                                                controls
                                            />
                                            <label className="inline-flex items-center gap-2 text-xs text-[#0ea5e9] cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleUpload(file)
                                                    }}
                                                />
                                                重新上传
                                            </label>
                                        </div>
                                    )}
                                    {uploading && <div className="text-xs text-gray-400">上传中...</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600 text-right">权重：</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    placeholder="请输入权重"
                                />
                            </div>

                            <div className="flex justify-center gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm bg-gray-200 rounded">取消</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-[#3b82f6] text-white rounded">确定</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import ImageUpload from '@/app/admin/components/ImageUpload'

interface CompanyInfoItem {
    id: number
    mapImageEn: string | null
    mapImageZh: string | null
    companyName: string | null
    companyAddress: string | null
    companyEmail: string | null
    companyPhone: string | null
    companyWebsite: string | null
    createdAt: string
    updatedAt: string
}

export default function CompanyInfoPage() {
    const [items, setItems] = useState<CompanyInfoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<CompanyInfoItem | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [form, setForm] = useState({
        mapImageEn: '',
        mapImageZh: '',
        companyName: '',
        companyAddress: '',
        companyEmail: '',
        companyPhone: '',
        companyWebsite: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/inquiries/company', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                const normalized = Array.isArray(data)
                    ? data.map((raw: any) => {
                        const rawId = raw?.id ?? raw?.ID ?? raw?.Id ?? raw?._id
                        const id = Number.parseInt(String(rawId), 10)
                        return { ...raw, id }
                    }).filter((x: any) => Number.isFinite(x.id) && x.id > 0)
                    : []
                setItems(normalized)
            } else {
                showToast('获取数据失败', 'error')
            }
        } catch (e) {
            console.error('Failed to fetch company info', e)
            showToast('获取数据失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    const openCreate = () => {
        setEditing(null)
        setForm({
            mapImageEn: '',
            mapImageZh: '',
            companyName: '',
            companyAddress: '',
            companyEmail: '',
            companyPhone: '',
            companyWebsite: ''
        })
        setShowModal(true)
    }

    const openEdit = (item: CompanyInfoItem) => {
        setEditing(item)
        setForm({
            mapImageEn: item.mapImageEn || '',
            mapImageZh: item.mapImageZh || '',
            companyName: item.companyName || '',
            companyAddress: item.companyAddress || '',
            companyEmail: item.companyEmail || '',
            companyPhone: item.companyPhone || '',
            companyWebsite: item.companyWebsite || ''
        })
        setShowModal(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { ...form }
        try {
            let res: Response
            if (editing) {
                const id = Number(editing.id)
                if (!Number.isFinite(id) || id <= 0) {
                    showToast(`Invalid id: ${String((editing as any)?.id)}`, 'error')
                    return
                }
                res = await fetch(`/api/admin/inquiries/company/${editing.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                res = await fetch('/api/admin/inquiries/company', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                showToast(data?.error || '保存失败', 'error')
                return
            }
            setShowModal(false)
            fetchData()
            showToast('保存成功', 'success')
        } catch (e) {
            console.error('Save failed', e)
            showToast('保存失败', 'error')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该公司信息？')) return
        try {
            const res = await fetch(`/api/admin/inquiries/company/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                showToast(data?.error || '删除失败', 'error')
                return
            }
            fetchData()
            showToast('删除成功', 'success')
        } catch (e) {
            console.error('Delete failed', e)
            showToast('删除失败', 'error')
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm shadow-lg border ${toast.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {toast.message}
                </div>
            )}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">公司信息管理</h1>
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
                            <th className="px-6 py-4">地图图片（英）</th>
                            <th className="px-6 py-4">地图图片（中）</th>
                            <th className="px-6 py-4">公司名称</th>
                            <th className="px-6 py-4">公司地址</th>
                            <th className="px-6 py-4">公司邮箱</th>
                            <th className="px-6 py-4">公司电话</th>
                            <th className="px-6 py-4">公司网址</th>
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
                                    <td className="px-6 py-4">
                                        {item.mapImageEn ? (
                                            <img src={item.mapImageEn} alt="EN Map" className="w-20 h-12 object-cover rounded" />
                                        ) : (
                                            <span className="text-xs text-gray-400">无</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.mapImageZh ? (
                                            <img src={item.mapImageZh} alt="ZH Map" className="w-20 h-12 object-cover rounded" />
                                        ) : (
                                            <span className="text-xs text-gray-400">无</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">{item.companyName || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs max-w-[260px] truncate" title={item.companyAddress || ''}>{item.companyAddress || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{item.companyEmail || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{item.companyPhone || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{item.companyWebsite || '-'}</td>
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[720px] max-w-[92vw] shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">{editing ? '编辑' : '新增'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">地图图片（英）</label>
                                    <ImageUpload value={form.mapImageEn} onChange={(url) => setForm(prev => ({ ...prev, mapImageEn: url }))} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">地图图片（中）</label>
                                    <ImageUpload value={form.mapImageZh} onChange={(url) => setForm(prev => ({ ...prev, mapImageZh: url }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">公司名称</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={form.companyName}
                                        onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                                        placeholder="请输入公司名称"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">公司邮箱</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={form.companyEmail}
                                        onChange={(e) => setForm(prev => ({ ...prev, companyEmail: e.target.value }))}
                                        placeholder="请输入公司邮箱"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">公司地址</label>
                                <input
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={form.companyAddress}
                                    onChange={(e) => setForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                                    placeholder="请输入公司地址"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">公司电话</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={form.companyPhone}
                                        onChange={(e) => setForm(prev => ({ ...prev, companyPhone: e.target.value }))}
                                        placeholder="请输入公司电话"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">公司网址</label>
                                    <input
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={form.companyWebsite}
                                        onChange={(e) => setForm(prev => ({ ...prev, companyWebsite: e.target.value }))}
                                        placeholder="请输入公司网址"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm rounded bg-gray-100 text-gray-600"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm rounded bg-[#0ea5e9] text-white"
                                >
                                    确定
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

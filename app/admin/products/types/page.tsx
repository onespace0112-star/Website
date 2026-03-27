'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface CategoryItem {
    id: number
    nameEn: string
    nameZh: string
    typeId: number
    sortOrder: number
    createdAt: string
}

interface TypeItem {
    id: number
    nameEn: string
    nameZh: string
    sortOrder: number
    createdAt: string
    categories: CategoryItem[]
}

export default function ProductTypesPage() {
    const [types, setTypes] = useState<TypeItem[]>([])
    const [loading, setLoading] = useState(true)

    // Type modal
    const [showTypeModal, setShowTypeModal] = useState(false)
    const [editingType, setEditingType] = useState<TypeItem | null>(null)
    const [typeForm, setTypeForm] = useState({ nameEn: '', nameZh: '', sortOrder: 0 })

    // Category modal
    const [showCatModal, setShowCatModal] = useState(false)
    const [editingCat, setEditingCat] = useState<CategoryItem | null>(null)
    const [catForm, setCatForm] = useState({ nameEn: '', nameZh: '', typeId: 0, sortOrder: 0 })

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                const data = await res.json()
                setTypes(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error('Failed to fetch', e)
        } finally {
            setLoading(false)
        }
    }

    const allCategories = types.flatMap(t => t.categories.map(c => ({ ...c, typeName: t.nameEn, typeNameZh: t.nameZh })))

    // --- Type CRUD ---
    const openCreateType = () => {
        setEditingType(null)
        setTypeForm({ nameEn: '', nameZh: '', sortOrder: 0 })
        setShowTypeModal(true)
    }
    const openEditType = (item: TypeItem) => {
        setEditingType(item)
        setTypeForm({ nameEn: item.nameEn, nameZh: item.nameZh, sortOrder: item.sortOrder })
        setShowTypeModal(true)
    }
    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingType) {
                await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: 'type', id: editingType.id, ...typeForm })
                })
            } else {
                await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: 'type', ...typeForm })
                })
            }
            setShowTypeModal(false)
            fetchData()
        } catch (e) { console.error('Save failed', e) }
    }
    const handleDeleteType = async (id: number, name: string) => {
        if (!confirm(`确定删除产品类型「${name}」？删除后其下所有系项和产品将被一起删除。`)) return
        try {
            await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'type', id })
            })
            fetchData()
        } catch (e) { console.error('Delete failed', e) }
    }

    // --- Category CRUD ---
    const openCreateCat = () => {
        setEditingCat(null)
        setCatForm({ nameEn: '', nameZh: '', typeId: types[0]?.id || 0, sortOrder: 0 })
        setShowCatModal(true)
    }
    const openEditCat = (item: CategoryItem) => {
        setEditingCat(item)
        setCatForm({ nameEn: item.nameEn, nameZh: item.nameZh, typeId: item.typeId, sortOrder: item.sortOrder })
        setShowCatModal(true)
    }
    const handleSaveCat = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingCat) {
                await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: 'category', id: editingCat.id, ...catForm })
                })
            } else {
                await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: 'category', ...catForm })
                })
            }
            setShowCatModal(false)
            fetchData()
        } catch (e) { console.error('Save failed', e) }
    }
    const handleDeleteCat = async (id: number, name: string) => {
        if (!confirm(`确定删除产品系项「${name}」？删除后其下所有产品将被一起删除。`)) return
        try {
            await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'category', id })
            })
            fetchData()
        } catch (e) { console.error('Delete failed', e) }
    }

    const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-2xl font-bold text-gray-800">产品类型及系项</h1>

            {/* Product Types */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[#0ea5e9]">产品类型</h2>
                    <button onClick={openCreateType} className="flex items-center gap-1 text-sm text-[#0ea5e9] hover:text-[#0284c7] font-medium">
                        <Plus className="w-4 h-4" /> 新建类型
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                            <tr>
                                <th className="px-6 py-3 w-16">序号</th>
                                <th className="px-6 py-3">产品类型</th>
                                <th className="px-6 py-3 w-20">权重</th>
                                <th className="px-6 py-3">提交时间</th>
                                <th className="px-6 py-3 text-center w-28">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-400">加载中...</td></tr>
                            ) : types.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-400">暂无数据</td></tr>
                            ) : types.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-3 text-gray-800">
                                        {item.nameEn}
                                        {item.nameZh && <span className="text-gray-400 ml-2">({item.nameZh})</span>}
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{item.sortOrder}</td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(item.createdAt)}</td>
                                    <td className="px-6 py-3 text-center">
                                        <button onClick={() => openEditType(item)} className="text-[#0ea5e9] hover:underline text-sm mr-3">编辑</button>
                                        <button onClick={() => handleDeleteType(item.id, item.nameEn)} className="text-red-500 hover:underline text-sm">删除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Series (Categories) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[#0ea5e9]">产品系项</h2>
                    <button onClick={openCreateCat} disabled={types.length === 0} className="flex items-center gap-1 text-sm text-[#0ea5e9] hover:text-[#0284c7] font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus className="w-4 h-4" /> 新建系项
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                            <tr>
                                <th className="px-6 py-3 w-16">序号</th>
                                <th className="px-6 py-3">产品系项</th>
                                <th className="px-6 py-3">所属类型</th>
                                <th className="px-6 py-3 w-20">权重</th>
                                <th className="px-6 py-3">提交时间</th>
                                <th className="px-6 py-3 text-center w-28">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-400">加载中...</td></tr>
                            ) : allCategories.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-400">暂无数据</td></tr>
                            ) : allCategories.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-3 text-gray-800">
                                        {item.nameEn}
                                        {item.nameZh && <span className="text-gray-400 ml-2">({item.nameZh})</span>}
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{item.typeName}</td>
                                    <td className="px-6 py-3 text-gray-600">{item.sortOrder}</td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(item.createdAt)}</td>
                                    <td className="px-6 py-3 text-center">
                                        <button onClick={() => openEditCat(item)} className="text-[#0ea5e9] hover:underline text-sm mr-3">编辑</button>
                                        <button onClick={() => handleDeleteCat(item.id, item.nameEn)} className="text-red-500 hover:underline text-sm">删除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Type Modal */}
            {showTypeModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#0ea5e9] text-white">
                            <h3 className="font-semibold">{editingType ? '编辑产品类型' : '新建产品类型'}</h3>
                            <button onClick={() => setShowTypeModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveType} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">产品类型</label>
                                <input
                                    value={typeForm.nameEn}
                                    onChange={e => setTypeForm({ ...typeForm, nameEn: e.target.value })}
                                    placeholder="请输入产品类型(英文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">中文名称</label>
                                <input
                                    value={typeForm.nameZh}
                                    onChange={e => setTypeForm({ ...typeForm, nameZh: e.target.value })}
                                    placeholder="请输入产品类型(中文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">权重</label>
                                <input
                                    type="number"
                                    value={typeForm.sortOrder}
                                    onChange={e => setTypeForm({ ...typeForm, sortOrder: Number(e.target.value) })}
                                    placeholder="请输入权重"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button type="button" onClick={() => setShowTypeModal(false)} className="px-6 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">取消</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7]">确定</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#0ea5e9] text-white">
                            <h3 className="font-semibold">{editingCat ? '编辑产品系项' : '新建产品系项'}</h3>
                            <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveCat} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">产品系项</label>
                                <input
                                    value={catForm.nameEn}
                                    onChange={e => setCatForm({ ...catForm, nameEn: e.target.value })}
                                    placeholder="请输入产品系项(英文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">中文名称</label>
                                <input
                                    value={catForm.nameZh}
                                    onChange={e => setCatForm({ ...catForm, nameZh: e.target.value })}
                                    placeholder="请输入产品系项(中文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">所属类型</label>
                                <select
                                    value={catForm.typeId}
                                    onChange={e => setCatForm({ ...catForm, typeId: Number(e.target.value) })}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                    required
                                >
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.nameEn}{t.nameZh ? ` (${t.nameZh})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">权重</label>
                                <input
                                    type="number"
                                    value={catForm.sortOrder}
                                    onChange={e => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
                                    placeholder="请输入权重"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button type="button" onClick={() => setShowCatModal(false)} className="px-6 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">取消</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7]">确定</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import ImageUpload from '../components/ImageUpload'

interface ProductItem {
    id: number
    nameEn: string
    nameZh: string
    image: string
    categoryId: number
    sortOrder: number
    createdAt: string
}

interface CategoryItem {
    id: number
    nameEn: string
    nameZh: string
    typeId: number
    sortOrder: number
    products: ProductItem[]
}

interface TypeItem {
    id: number
    nameEn: string
    nameZh: string
    sortOrder: number
    categories: CategoryItem[]
}

interface FlatProduct extends ProductItem {
    typeName: string
    categoryName: string
    typeId: number
}

export default function ProductsAdminPage() {
    const [types, setTypes] = useState<TypeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState({
        nameEn: '',
        nameZh: '',
        image: '',
        typeId: 0,
        categoryId: 0,
        sortOrder: 0,
    })

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/products?t=' + Date.now())
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

    // Flatten all products with type/category info, sort by type order → product sortOrder
    const allProducts: FlatProduct[] = types.flatMap((type, typeIdx) =>
        type.categories.flatMap(cat =>
            cat.products.map(p => ({
                ...p,
                typeName: type.nameEn + (type.nameZh ? `(${type.nameZh})` : ''),
                categoryName: cat.nameEn + (cat.nameZh ? `(${cat.nameZh})` : ''),
                typeId: type.id,
                _typeSortOrder: type.sortOrder,
            }))
        )
    ).sort((a, b) => a._typeSortOrder - b._typeSortOrder || a.sortOrder - b.sortOrder)

    // Filter by search
    const filteredProducts = search.trim()
        ? allProducts.filter(p =>
            p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
            p.nameZh.toLowerCase().includes(search.toLowerCase())
        )
        : allProducts

    // Get categories for selected type in form
    const formCategories = types.find(t => t.id === form.typeId)?.categories || []

    const openCreate = () => {
        setEditingId(null)
        setForm({
            nameEn: '', nameZh: '', image: '',
            typeId: types[0]?.id || 0,
            categoryId: types[0]?.categories[0]?.id || 0,
            sortOrder: 0,
        })
        setShowModal(true)
    }

    const openEdit = (item: FlatProduct) => {
        setEditingId(item.id)
        setForm({
            nameEn: item.nameEn,
            nameZh: item.nameZh,
            image: item.image,
            typeId: item.typeId,
            categoryId: item.categoryId,
            sortOrder: item.sortOrder,
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.nameEn.trim()) { alert('请输入产品标题'); return }
        if (!form.categoryId) { alert('请选择产品系项'); return }
        try {
            const res = editingId
                ? await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entity: 'product',
                        id: editingId,
                        nameEn: form.nameEn,
                        nameZh: form.nameZh,
                        image: form.image,
                        categoryId: form.categoryId,
                        sortOrder: form.sortOrder,
                    })
                })
                : await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entity: 'product',
                        nameEn: form.nameEn,
                        nameZh: form.nameZh,
                        image: form.image,
                        categoryId: form.categoryId,
                        sortOrder: form.sortOrder,
                    })
                })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                alert('保存失败: ' + (err.error || res.statusText))
                return
            }
            setShowModal(false)
            fetchData()
        } catch (e) {
            console.error('Save failed', e)
            alert('保存失败，请重试')
        }
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`确定删除产品「${name}」？`)) return
        try {
            await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entity: 'product', id })
            })
            fetchData()
        } catch (e) {
            console.error('Delete failed', e)
        }
    }

    const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

    // When typeId changes in form, reset categoryId to first available
    const handleTypeChange = (typeId: number) => {
        const cats = types.find(t => t.id === typeId)?.categories || []
        setForm({ ...form, typeId, categoryId: cats[0]?.id || 0 })
    }

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-800">产品列表</h1>

            {/* Search + Add */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="请输入产品标题"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <button
                    onClick={openCreate}
                    disabled={types.length === 0}
                    className="flex items-center gap-1 text-sm bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" /> 添加产品
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-14">序号</th>
                            <th className="px-4 py-3 w-16">图片</th>
                            <th className="px-4 py-3">标题</th>
                            <th className="px-4 py-3">产品类型</th>
                            <th className="px-4 py-3">产品系项</th>
                            <th className="px-4 py-3 w-16">权重</th>
                            <th className="px-4 py-3">提交时间</th>
                            <th className="px-4 py-3 text-center w-28">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
                        ) : filteredProducts.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.nameEn} fill sizes="40px" className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">N/A</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-800">
                                    {item.nameEn}
                                    {item.nameZh && <div className="text-xs text-gray-400">{item.nameZh}</div>}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">{item.typeName}</td>
                                <td className="px-4 py-3 text-gray-600 text-xs">{item.categoryName}</td>
                                <td className="px-4 py-3 text-gray-600">{item.sortOrder}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.createdAt)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => openEdit(item)} className="text-[#0ea5e9] hover:underline text-sm mr-3">编辑</button>
                                    <button onClick={() => handleDelete(item.id, item.nameEn)} className="text-red-500 hover:underline text-sm">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#0ea5e9] text-white">
                            <h3 className="font-semibold">{editingId ? '编辑产品' : '添加产品'}</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">产品标题</label>
                                <input
                                    value={form.nameEn}
                                    onChange={e => setForm({ ...form, nameEn: e.target.value })}
                                    placeholder="请输入产品标题(英文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">中文标题</label>
                                <input
                                    value={form.nameZh}
                                    onChange={e => setForm({ ...form, nameZh: e.target.value })}
                                    placeholder="请输入产品标题(中文)"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex items-start gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0 pt-2">产品图片</label>
                                <ImageUpload
                                    value={form.image}
                                    onChange={(url) => setForm({ ...form, image: url })}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">产品类型</label>
                                <select
                                    value={form.typeId}
                                    onChange={e => handleTypeChange(Number(e.target.value))}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                >
                                    <option value={0} disabled>请选择产品类型</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.nameEn}{t.nameZh ? ` (${t.nameZh})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">产品系项</label>
                                <select
                                    value={form.categoryId}
                                    onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                >
                                    <option value={0} disabled>请选择产品系项</option>
                                    {formCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nameEn}{c.nameZh ? ` (${c.nameZh})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">权重</label>
                                <input
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                    placeholder="请输入权重"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">取消</button>
                                <button type="button" onClick={handleSave} className="px-6 py-2 text-sm bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7]">确定</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

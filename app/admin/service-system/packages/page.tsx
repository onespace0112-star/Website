'use client'

import React, { useState, useEffect } from 'react'

type DesignPkg = {
    id: number
    serviceType: string
    houseArea: string
    fee: string
    serviceItems: string
    sortOrder: number
    createdAt: string
}

type ProcurementPkg = {
    id: number
    serviceType: string
    fee: string
    serviceItems: string
    travelTime: string
    sortOrder: number
    createdAt: string
}

const serviceTypeOptions = [
    { value: '采购服务', label: '采购服务' },
    { value: '设计服务', label: '设计服务' },
]

export default function ServicePackagesPage() {
    const [tab, setTab] = useState<'design' | 'procurement'>('design')
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; type: string; message: string }>({ show: false, type: '', message: '' })

    const fetchItems = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/service-packages?category=${tab}`)
            if (res.ok) setItems(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    useEffect(() => { fetchItems() }, [tab])

    const showToast = (type: string, message: string) => {
        setToast({ show: true, type, message })
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000)
    }

    const openAdd = () => {
        setEditing(null)
        if (tab === 'design') {
            setForm({ serviceType: '', houseArea: '', fee: '', serviceItems: '', sortOrder: 0 })
        } else {
            setForm({ serviceType: '', fee: '', serviceItems: '', travelTime: '', sortOrder: 0 })
        }
        setShowModal(true)
    }

    const openEdit = (item: any) => {
        setEditing(item)
        if (tab === 'design') {
            setForm({
                serviceType: item.serviceType,
                houseArea: item.houseArea,
                fee: item.fee,
                serviceItems: item.serviceItems,
                sortOrder: item.sortOrder,
            })
        } else {
            setForm({
                serviceType: item.serviceType,
                fee: item.fee,
                serviceItems: item.serviceItems,
                travelTime: item.travelTime,
                sortOrder: item.sortOrder,
            })
        }
        setShowModal(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const url = editing
                ? `/api/admin/service-packages/${editing.id}`
                : '/api/admin/service-packages'
            const method = editing ? 'PATCH' : 'POST'
            const body = { category: tab, ...form }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                showToast('success', editing ? '修改成功' : '添加成功')
                setShowModal(false)
                fetchItems()
            } else {
                showToast('error', '操作失败')
            }
        } catch {
            showToast('error', '操作失败')
        }
        setSaving(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该服务？')) return
        try {
            const res = await fetch(`/api/admin/service-packages/${id}?category=${tab}`, { method: 'DELETE' })
            if (res.ok) {
                showToast('success', '删除成功')
                fetchItems()
            } else {
                showToast('error', '删除失败')
            }
        } catch {
            showToast('error', '删除失败')
        }
    }

    const formatDate = (d: string) => {
        const date = new Date(d)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    return (
        <div className="p-6">
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg text-white text-sm shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6 text-gray-800">服务管理</h1>

            {/* Tab + Add */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex">
                    <button
                        onClick={() => setTab('procurement')}
                        className={`px-6 py-2 text-sm font-bold rounded-l-lg transition-all cursor-pointer ${tab === 'procurement' ? 'bg-[#00aaff] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        采购服务
                    </button>
                    <button
                        onClick={() => setTab('design')}
                        className={`px-6 py-2 text-sm font-bold rounded-r-lg transition-all cursor-pointer ${tab === 'design' ? 'bg-[#00aaff] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        设计服务
                    </button>
                </div>
                <button
                    onClick={openAdd}
                    className="px-5 py-2 bg-white text-[#00aaff] border-2 border-[#00aaff] text-sm font-bold rounded-lg hover:bg-[#00aaff] hover:text-white transition-all cursor-pointer"
                >
                    + 添加服务
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">序号</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">服务类型</th>
                            {tab === 'design' && <th className="px-4 py-3 text-left text-gray-600 font-medium">房屋面积</th>}
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">{tab === 'design' ? '项目启动费用' : '服务费用'}</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">服务系项</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">权重</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">创建时间</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
                        ) : items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                <td className="px-4 py-3 text-gray-800">{item.serviceType}</td>
                                {tab === 'design' && <td className="px-4 py-3 text-gray-800">{(item as DesignPkg).houseArea || '-'}</td>}
                                <td className="px-4 py-3 text-gray-800">{item.fee}</td>
                                <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{item.serviceItems}</td>
                                <td className="px-4 py-3 text-gray-600">{item.sortOrder}</td>
                                <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                                <td className="px-4 py-3 space-x-3">
                                    <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer">编辑</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium cursor-pointer">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editing ? '编辑' : '添加'}{tab === 'design' ? '设计服务' : '采购服务'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">&times;</button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {/* Fee */}
                            <div className="flex items-center gap-4">
                                <label className="w-24 text-sm font-bold text-gray-700 text-right shrink-0">
                                    {tab === 'design' ? '项目启动费用' : '服务费用'}
                                </label>
                                <input
                                    type="text"
                                    value={form.fee || ''}
                                    onChange={e => setForm({ ...form, fee: e.target.value })}
                                    placeholder={tab === 'design' ? '请输入项目启动费用' : '请输入服务费用'}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 outline-none"
                                />
                            </div>

                            {/* Service Items */}
                            <div className="flex items-start gap-4">
                                <label className="w-24 text-sm font-bold text-gray-700 text-right shrink-0 pt-2">服务系项</label>
                                <textarea
                                    value={form.serviceItems || ''}
                                    onChange={e => setForm({ ...form, serviceItems: e.target.value })}
                                    rows={4}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 outline-none resize-none"
                                />
                            </div>

                            {/* Service Type */}
                            <div className="flex items-center gap-4">
                                <label className="w-24 text-sm font-bold text-gray-700 text-right shrink-0">服务类型</label>
                                <select
                                    value={form.serviceType || ''}
                                    onChange={e => setForm({ ...form, serviceType: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 outline-none"
                                >
                                    <option value="">请选择服务类型</option>
                                    {serviceTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Design: House Area */}
                            {tab === 'design' && (
                                <div className="flex items-center gap-4">
                                    <label className="w-24 text-sm font-bold text-gray-700 text-right shrink-0">房屋面积</label>
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={form.houseArea || ''}
                                            onChange={e => setForm({ ...form, houseArea: e.target.value })}
                                            placeholder="请输入房屋面积"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 outline-none"
                                        />
                                        <span className="text-sm text-gray-500">m²</span>
                                    </div>
                                </div>
                            )}

                            {/* Sort Order */}
                            <div className="flex items-center gap-4">
                                <label className="w-24 text-sm font-bold text-gray-700 text-right shrink-0">权重</label>
                                <input
                                    type="number"
                                    value={form.sortOrder ?? 0}
                                    onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 outline-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 bg-[#00aaff] text-white text-sm font-bold rounded-lg hover:bg-[#0099ee] transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? '保存中...' : '确定'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

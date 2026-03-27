'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Pencil, Trash2, X, Check, AlertCircle, Loader2, Download } from 'lucide-react'
import HeaderManager from '../components/HeaderManager'

interface Inquiry {
    id: number
    name: string
    email: string
    phone: string
    country: string
    description: string
    role?: string
    contactMethod?: string
    contactTime?: string
    projectType?: string
    propertyType?: string
    surfaceArea?: string
    budgetRange?: string
    expectedTimeline?: string
    floorPlanStatus?: string
    createdAt: string
}

interface Toast {
    message: string
    type: 'success' | 'error'
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<Toast | null>(null)

    // Modals
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // State
    const [currentInquiry, setCurrentInquiry] = useState<Partial<Inquiry>>({})
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchInquiries()
    }, [])

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/admin/inquiries/list')
            if (res.ok) {
                const data = await res.json()
                setInquiries(data)
            }
        } catch (error) {
            console.error('Failed to fetch inquiries:', error)
            showToast('获取数据失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        const header = ['ID', '姓名', '手机号', '邮箱地址', '国家', '项目类型', '物业类型', '预估开始时间', '预估面积', '预估预算', '户型图 / 尺寸', '您的角色', '首选联系方式', '最佳联系时间', '补充说明', '提交时间'];
        const data = inquiries.map(item => [
            item.id,
            item.name,
            item.phone,
            item.email,
            item.country,
            item.projectType,
            item.propertyType,
            item.expectedTimeline,
            item.surfaceArea,
            item.budgetRange,
            item.floorPlanStatus,
            item.role,
            item.contactMethod,
            item.contactTime,
            item.description,
            new Date(item.createdAt).toLocaleString()
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        // 设置列宽
        ws['!cols'] = [
            { wch: 6 },  // ID
            { wch: 15 }, // 姓名
            { wch: 15 }, // 手机号
            { wch: 25 }, // 邮箱地址
            { wch: 10 }, // 国家
            { wch: 20 }, // 项目类型
            { wch: 15 }, // 物业类型
            { wch: 20 }, // 预估开始时间
            { wch: 15 }, // 预估面积
            { wch: 20 }, // 预估预算
            { wch: 20 }, // 户型图 / 尺寸
            { wch: 15 }, // 您的角色
            { wch: 15 }, // 首选联系方式
            { wch: 15 }, // 最佳联系时间
            { wch: 50 }, // 补充说明
            { wch: 22 }, // 提交时间
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inquiries');

        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `意向列表_${date}.xlsx`);

        // Log the action
        fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: '导出数据',
                content: `导出了意向列表数据 (共 ${data.length} 条)`
            })
        }).catch(err => console.error('Log export failed', err));
    }

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            const res = await fetch(`/api/admin/inquiries/${itemToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setItemToDelete(null)
                fetchInquiries()
                showToast('删除成功', 'success')
            } else {
                showToast('删除失败', 'error')
            }
        } catch (error) {
            console.error('Delete error:', error)
            showToast('删除出错', 'error')
        }
    }

    const handleEditClick = (inquiry: Inquiry) => {
        setCurrentInquiry(inquiry)
        setShowEditModal(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentInquiry.id) return

        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentInquiry)
            })
            if (res.ok) {
                setShowEditModal(false)
                fetchInquiries()
                showToast('保存成功', 'success')
            } else {
                showToast('保存失败', 'error')
            }
        } catch (error) {
            console.error('Save error:', error)
            showToast('保存出错', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 p-6 font-sans relative min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#0ea5e9] rounded-full"></span>
                    意向管理
                </h1>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-sm"
                >
                    <Download className="w-4 h-4" />
                    导出Excel
                </button>
            </div>


            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-16">ID</th>
                            <th className="px-6 py-4 min-w-[100px]">姓名</th>
                            <th className="px-6 py-4 min-w-[120px]">手机号</th>
                            <th className="px-6 py-4 min-w-[150px]">邮箱地址</th>
                            <th className="px-6 py-4 min-w-[80px]">国家</th>
                            <th className="px-6 py-4 min-w-[100px]">项目类型</th>
                            <th className="px-6 py-4 min-w-[100px]">物业类型</th>
                            <th className="px-6 py-4 min-w-[120px]">预估开始时间</th>
                            <th className="px-6 py-4 min-w-[100px]">预估面积</th>
                            <th className="px-6 py-4 min-w-[120px]">预估预算</th>
                            <th className="px-6 py-4 min-w-[120px]">户型图 / 尺寸</th>
                            <th className="px-6 py-4 min-w-[100px]">您的角色</th>
                            <th className="px-6 py-4 min-w-[120px]">首选联系方式</th>
                            <th className="px-6 py-4 min-w-[120px]">最佳联系时间</th>
                            <th className="px-6 py-4 min-w-[200px]">补充说明</th>
                            <th className="px-6 py-4 min-w-[100px] text-center sticky right-0 bg-gray-50">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={16} className="px-6 py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#0ea5e9]" />
                                    <span>加载中...</span>
                                </td>
                            </tr>
                        ) : inquiries.length === 0 ? (
                            <tr>
                                <td colSpan={16} className="px-6 py-12 text-center text-gray-400 bg-gray-50/50">
                                    暂无数据
                                </td>
                            </tr>
                        ) : (
                            inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{inquiry.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{inquiry.name}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{inquiry.phone || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs break-all">{inquiry.email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.country || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.projectType || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.propertyType || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.expectedTimeline || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.surfaceArea || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{inquiry.budgetRange || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.floorPlanStatus || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.role || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.contactMethod || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{inquiry.contactTime || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={inquiry.description}>{inquiry.description || '-'}</td>
                                    <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/30 transition-colors shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(inquiry)}
                                                className="p-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10 rounded-full transition-colors"
                                                title="编辑"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(inquiry.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center font-sans p-4">
                    <div className="bg-white w-full max-w-lg shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-[#0ea5e9]" />
                                编辑意向
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">姓名</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.name || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">邮箱</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.email || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">电话</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.phone || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">国家</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.country || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, country: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">项目类型</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.projectType || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, projectType: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">物业类型</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.propertyType || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, propertyType: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">预算范围</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.budgetRange || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, budgetRange: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">面积</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all"
                                            value={currentInquiry.surfaceArea || ''}
                                            onChange={e => setCurrentInquiry({ ...currentInquiry, surfaceArea: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-600 font-bold text-xs uppercase tracking-wider">描述</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all resize-none"
                                        value={currentInquiry.description || ''}
                                        onChange={e => setCurrentInquiry({ ...currentInquiry, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-semibold"
                                >
                                    取消更改
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg text-sm hover:bg-[#0284c7] transition-all font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSaving ? '保存中...' : '保存更改'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center font-sans p-4">
                    <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up transform scale-100">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除?</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                您确定要删除此条意向记录吗？<br />此操作无法撤销。
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors font-bold"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 font-bold"
                                >
                                    确定删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] animate-fade-in-up">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${toast.type === 'success'
                        ? 'bg-white border-green-100 text-green-800'
                        : 'bg-white border-red-100 text-red-800'
                        }`}>
                        <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {toast.type === 'success' ? (
                                <Check className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

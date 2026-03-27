
'use client'

import React, { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, X, Loader2, Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

interface Header {
    id: number
    page: string
    title: string
    description: string | null
    image: string | null
    height: number
    createdAt: string
}

interface HeaderManagerProps {
    page: string
    pageTitle: string
}

export default function HeaderManager({ page, pageTitle }: HeaderManagerProps) {
    const [headers, setHeaders] = useState<Header[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
    const [editingHeader, setEditingHeader] = useState<Partial<Header> | null>(null)
    const [imageLoadFailed, setImageLoadFailed] = useState(false)
    const [imageCacheBuster, setImageCacheBuster] = useState<number>(Date.now())
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

    const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }

    useEffect(() => {
        if (page) {
            fetchHeaders()
        }
    }, [page])

    const fetchHeaders = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/headers?page=${page}&t=${Date.now()}`)
            if (res.ok) {
                const data = await res.json()
                setHeaders(data)
            }
        } catch (error) {
            console.error('Fetch error:', error)
            showMessage('获取列表失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    const normalizeImageSrc = (src?: string | null, cacheBuster?: number) => {
        if (!src) return ''
        const normalized = src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`
        const encoded = encodeURI(normalized)
        // Add cache busting parameter to ensure fresh images are loaded
        return cacheBuster ? `${encoded}?t=${cacheBuster}` : encoded
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('HandleSave triggered', { editingHeader, page });

        if (!editingHeader?.title) {
            alert('标题不能为空');
            return;
        }

        setIsSaving(true)
        const isEdit = !!editingHeader.id;

        if (isEdit && !editingHeader.id) {
            console.error('Edit mode but ID is missing!', editingHeader);
            alert('错误：无法获取配置ID，请尝试刷新页面重试');
            setIsSaving(false);
            return;
        }

        try {
            const url = isEdit
                ? `/api/admin/headers/${editingHeader.id}`
                : '/api/admin/headers'

            // Use PATCH for updates as it's more standard for partial updates and less likely to be blocked
            const method = isEdit ? 'PATCH' : 'POST'
            console.log(`[CLIENT DEBUG] Sending ${method} to ${url}`, { id: editingHeader.id, title: editingHeader.title });

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingHeader,
                    page,
                    image: editingHeader?.image
                        ? (editingHeader.image.startsWith('http') || editingHeader.image.startsWith('/') ? editingHeader.image : `/${editingHeader.image}`)
                        : editingHeader?.image
                })
            })

            console.log('Response status:', res.status);

            if (res.ok) {
                const result = await res.json();
                console.log('Save success:', result);
                setShowModal(false)
                setEditingHeader(null)
                showMessage(isEdit ? '修改成功' : '添加成功')
                fetchHeaders()
            } else {
                const data = await res.json()
                console.error('Save failed:', data);
                alert(`保存失败: ${data.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('Network error during save:', error);
            alert('网络请求失败，请检查网络连接或服务器状态');
        } finally {
            setIsSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return
        const id = showDeleteConfirm
        setShowDeleteConfirm(null)

        try {
            const res = await fetch(`/api/admin/headers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                showMessage('删除成功')
                // Optimistic UI update: Remove from local state immediately
                setHeaders(prev => prev.filter(h => h.id !== id))
                // Then fetch from server to sync
                fetchHeaders()
            } else {
                const data = await res.json()
                showMessage(data.error || '删除失败，请重试', 'error')
            }
        } catch (error) {
            showMessage('网络请求失败', 'error')
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8 font-sans">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-[20px] font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#0ea5e9] rounded-full"></span>
                    头部管理 {pageTitle && `(${pageTitle})`}
                </h2>
                <button
                    onClick={() => {
                        setEditingHeader({ title: '', description: '', image: '', height: 400, page })
                        setImageLoadFailed(false)
                        setImageCacheBuster(Date.now())
                        setShowModal(true)
                    }}
                    className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    添加
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#fcfdfd] border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                            <th className="px-6 py-4 w-16 border-r border-gray-200 text-center">序号</th>
                            <th className="px-6 py-4 w-40 border-r border-gray-200 text-center">图片预览</th>
                            <th className="px-6 py-4 border-r border-gray-200 text-center">标题</th>
                            <th className="px-6 py-4 border-r border-gray-200 text-center w-28">高度 (px)</th>
                            <th className="px-6 py-4 border-r border-gray-200 text-center">描述</th>
                            <th className="px-6 py-4 text-center w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0ea5e9]" />
                                    <span className="text-sm">正在加载数据...</span>
                                </td>
                            </tr>
                        ) : headers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-gray-50/10">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <span className="text-sm">暂无头部配置，请点击添加</span>
                                </td>
                            </tr>
                        ) : (
                            headers.map((header, index) => (
                                <tr key={`header-${header.id}-${index}`} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-4 text-gray-400 font-mono border-r border-gray-50 text-center">{index + 1}</td>
                                    <td className="px-6 py-4 border-r border-gray-50">
                                        <div className="flex justify-center">
                                            {header.image ? (
                                                <img
                                                    src={normalizeImageSrc(header.image)}
                                                    className="w-24 h-14 object-cover rounded border border-gray-200 shadow-sm"
                                                    alt=""
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-24 h-14 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 border-r border-gray-50 text-center leading-relaxed">{header.title}</td>
                                    <td className="px-6 py-4 text-[#0ea5e9] border-r border-gray-50 text-center font-bold font-mono">{header.height}</td>
                                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate border-r border-gray-50 text-center italic">{header.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => {
                                                    setEditingHeader({ ...header })
                                                    setImageLoadFailed(false)
                                                    setImageCacheBuster(Date.now())
                                                    setShowModal(true)
                                                }}
                                                className="text-[#0ea5e9] hover:underline font-bold transition-all flex items-center gap-1"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(header.id)}
                                                className="text-red-500 hover:text-red-700 font-bold transition-all flex items-center gap-1"
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

            {/* Save Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0184c7] px-6 py-5 flex justify-between items-center">
                            <h3 className="text-white font-black text-xl tracking-tight">{editingHeader?.id ? '编辑头部配置' : '添加头部配置'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-7">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">配置标题</label>
                                    <input
                                        type="text"
                                        placeholder="例如：专业服务团队"
                                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9] transition-all bg-gray-50/50"
                                        value={editingHeader?.title || ''}
                                        onChange={e => setEditingHeader(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">容器高度 (px)</label>
                                    <input
                                        type="number"
                                        placeholder="标准：400"
                                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9] transition-all bg-gray-50/50"
                                        value={editingHeader?.height ?? ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const parsed = parseInt(val);
                                            setEditingHeader(prev => (prev ? {
                                                ...prev,
                                                height: isNaN(parsed) ? (val === '' ? 0 : 400) : parsed
                                            } : null));
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">背景图像</label>
                                    <FileUpload
                                        onUploadSuccess={(url) => {
                                            setImageLoadFailed(false)
                                            setImageCacheBuster(Date.now())
                                            setEditingHeader(prev => ({ ...prev, image: url }))
                                        }}
                                    >
                                        <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#0ea5e9] hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden relative group bg-gray-50/30">
                                            {editingHeader?.image && !imageLoadFailed ? (
                                                <>
                                                    <img
                                                        src={normalizeImageSrc(editingHeader.image, imageCacheBuster)}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                        onError={() => setImageLoadFailed(true)}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                                        <Plus className="text-white w-10 h-10" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="text-gray-300 w-10 h-10 group-hover:text-[#0ea5e9] transition-colors" />
                                                    <span className="text-xs text-gray-400 font-bold group-hover:text-[#0ea5e9]">
                                                        {imageLoadFailed ? '图片加载失败，请重新上传' : '点击或拖拽文件上传'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </FileUpload>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">补充说明</label>
                                    <textarea
                                        placeholder="可选：关于头部的详细描述内容"
                                        rows={3}
                                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9] transition-all bg-gray-50/50 resize-none font-sans"
                                        value={editingHeader?.description || ''}
                                        onChange={e => setEditingHeader(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center gap-6 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-black transition-all active:scale-95"
                                >
                                    返回
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#0184c7] text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即发布'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-10 text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">确认删除内容？</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 px-2">
                            您正在尝试永久删除该头部配置，删除后将无法找回。<br />确认要继续吗？
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl text-sm font-black transition-all"
                            >
                                我再想想
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3.5 bg-red-500 text-white hover:bg-red-600 rounded-2xl text-sm font-black transition-all shadow-xl shadow-red-500/30"
                            >
                                确定删除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast System */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[700] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'}`}>
                        <CheckCircle className={`w-6 h-6 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="font-black text-sm">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

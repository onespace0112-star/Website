'use client'

import React, { useEffect, useState, useRef } from 'react'
import HeaderManager from '../components/HeaderManager'

interface Process {
    id: number
    title: string
    description: string
    image: string | null
    order: number
    createdAt: string
    updatedAt: string | null
}

export default function ProcessPage() {
    const [processes, setProcesses] = useState<Process[]>([])
    const [loading, setLoading] = useState(true)

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentProcess, setCurrentProcess] = useState<Partial<Process>>({})
    const [processToDelete, setProcessToDelete] = useState<number | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/processes')
            const data = await res.json()
            if (Array.isArray(data)) setProcesses(data)
        } catch (err) {
            console.error('Failed to fetch processes:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = currentProcess.id ? 'PATCH' : 'POST'
        const url = currentProcess.id
            ? `/api/admin/processes/${currentProcess.id}`
            : '/api/admin/processes'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProcess)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
            }
        } catch (error) {
            console.error('Save error:', error)
        }
    }

    const handleDeleteClick = (id: number) => {
        setProcessToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!processToDelete) return
        try {
            const res = await fetch(`/api/admin/processes/${processToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setProcessToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setCurrentProcess(prev => ({ ...prev, image: data.url }))
            }
        } catch (err) {
            console.error('Upload failed:', err)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Header / Add Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => {
                        setCurrentProcess({ order: 0 })
                        setShowModal(true)
                    }}
                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors flex items-center gap-1 shadow-sm"
                >
                    <span className="text-lg leading-none pb-0.5">+</span> 添加
                </button>
            </div>

            {/* Table */}
            <div className="border border-gray-300 bg-white rounded-sm overflow-hidden">
                <table className="w-full text-center text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-300 text-gray-700 font-bold">
                        <tr>
                            <th className="px-4 py-3 border-r border-gray-300 w-16">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">流程图片</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">流程标题</th>
                            <th className="px-4 py-3 border-r border-gray-300">流程描述</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-16">权重</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {processes.map((p, index) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-2 py-2 border-r border-gray-200">
                                    {p.image && (
                                        <img src={p.image} alt="Icon" className="h-8 w-8 object-contain mx-auto" />
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{p.title}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600 truncate max-w-xs">{p.description}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{p.order}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(p.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {p.updatedAt
                                        ? new Date(p.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
                                        : ''}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => { setCurrentProcess(p); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(p.id)}
                                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {processes.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-gray-400">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-[#f0f2f5] w-full max-w-lg shadow-xl overflow-hidden rounded-sm animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-3 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg tracking-wide pl-2">
                                {currentProcess.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {/* Title */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">流程标题:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入流程标题"
                                        value={currentProcess.title || ''}
                                        onChange={e => setCurrentProcess({ ...currentProcess, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">流程图片:</label>
                                <div className="flex-1">
                                    <div
                                        className="w-24 h-24 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] bg-white text-gray-400 hover:text-[#0ea5e9] transition-colors relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {currentProcess.image ? (
                                            <img src={currentProcess.image} alt="Process" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <>
                                                <span className="text-xl">+</span>
                                                <span className="text-xs">上传</span>
                                            </>
                                        )}
                                        {uploading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">...</div>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">流程描述:</label>
                                <div className="flex-1">
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入您的流程描述"
                                        value={currentProcess.description || ''}
                                        onChange={e => setCurrentProcess({ ...currentProcess, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">权重:</label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入权重"
                                        value={currentProcess.order || 0}
                                        onChange={e => setCurrentProcess({ ...currentProcess, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-8 py-2 rounded text-sm hover:bg-gray-400 transition-colors font-medium shadow-sm"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#0ea5e9] text-white px-8 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors font-medium shadow-md"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                删除该流程，页面将不再展示此内容，您确定要继续删除吗？
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-6 py-1.5 rounded text-sm hover:bg-gray-400 hover:text-gray-800 transition-colors shadow-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors shadow-md font-medium"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

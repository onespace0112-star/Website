
'use client'

import React, { useState, useEffect } from 'react'
import { Pencil, Trash2, X, Upload } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import Image from 'next/image'

interface SiteLogo {
    id: number
    image: string
    width: number
    height: number
}

export default function LogoPage() {
    const [logo, setLogo] = useState<SiteLogo | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ image: '', width: 40, height: 40 })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchLogo()
    }, [])

    const fetchLogo = async () => {
        try {
            const res = await fetch('/api/admin/logo')
            if (res.ok) {
                const data = await res.json()
                setLogo(data) // data is single object or null
            }
        } catch (error) {
            console.error('Failed to fetch logo', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/logo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                fetchLogo()
                setShowModal(false)
            } else {
                const err = await res.json()
                alert(err.error || '保存失败')
            }
        } catch (error) {
            console.error('Failed to save logo', error)
            alert('保存过程中发生错误')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('确定要删除Logo吗?')) return
        try {
            const res = await fetch('/api/admin/logo', { method: 'DELETE' })
            if (res.ok) {
                setLogo(null)
            }
        } catch (error) {
            console.error('Failed to delete logo', error)
        }
    }

    const openEdit = () => {
        if (logo) {
            setFormData({ image: logo.image, width: logo.width, height: logo.height })
        } else {
            setFormData({ image: '', width: 40, height: 40 })
        }
        setShowModal(true)
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#0ea5e9] rounded-full"></span>
                Logo管理
            </h1>

            {!logo && (
                <button
                    onClick={openEdit}
                    className="bg-[#0ea5e9] text-white px-4 py-2 rounded shadow hover:bg-[#0284c7] transition"
                >
                    添加Logo
                </button>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                        <tr>
                            <th className="px-6 py-4 w-20">序号</th>
                            <th className="px-6 py-4">图片</th>
                            <th className="px-6 py-4">尺寸 (宽x高)</th>
                            <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logo ? (
                            <tr className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">1</td>
                                <td className="px-6 py-4">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded flex items-center justify-center p-1">
                                        <Image src={logo.image} alt="Logo" width={64} height={64} className="object-contain max-w-full max-h-full" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-mono">
                                    {logo.width} x {logo.height} px
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={openEdit}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 bg-gray-50/50">暂无Logo</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">{logo ? '编辑Logo' : '添加Logo'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Logo图</label>
                                <FileUpload
                                    onUploadSuccess={(url) => setFormData(d => ({ ...d, image: url }))}
                                />
                                {formData.image && (
                                    <div className="mt-2 text-center bg-gray-50 p-2 rounded border border-gray-100">
                                        <Image src={formData.image} alt="Preview" width={100} height={100} className="mx-auto h-20 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">宽 (px)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                                        value={formData.width}
                                        onChange={e => setFormData(d => ({ ...d, width: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">高 (px)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                                        value={formData.height}
                                        onChange={e => setFormData(d => ({ ...d, height: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.image || isSaving}
                                    className="px-6 py-2 bg-[#0ea5e9] text-white rounded-lg font-medium hover:bg-[#0284c7] disabled:opacity-50 transition shadow-lg shadow-[#0ea5e9]/20"
                                >
                                    {isSaving ? '保存中...' : '确定'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

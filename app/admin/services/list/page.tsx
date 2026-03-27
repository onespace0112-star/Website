'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import HeaderManager from '../../components/HeaderManager'

interface ServiceType {
    id: number
    name: string
}

interface ServiceItem {
    id: number
    typeId: number
    type: ServiceType
    image: string | null
    icon: string | null
    description: string | null
    order: number
    createdAt: string
    updatedAt: string | null
}

export default function ServiceListPage() {
    const [items, setItems] = useState<ServiceItem[]>([])
    const [types, setTypes] = useState<ServiceType[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState<string>('')
    const [keyword, setKeyword] = useState('')
    const [appliedKeyword, setAppliedKeyword] = useState('')

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentItem, setCurrentItem] = useState<Partial<ServiceItem>>({})
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingIcon, setUploadingIcon] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    const imageInputRef = useRef<HTMLInputElement>(null)
    const iconInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchTypes()
        fetchData()
    }, [])

    const fetchTypes = async () => {
        try {
            const res = await fetch('/api/admin/services/types')
            const data = await res.json()
            if (Array.isArray(data)) setTypes(data)
        } catch (err) {
            console.error('Failed to fetch types:', err)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/services/list')
            const data = await res.json()
            if (Array.isArray(data)) setItems(data)
        } catch (err) {
            console.error('Failed to fetch items:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const method = currentItem.id ? 'PATCH' : 'POST'
        const url = currentItem.id
            ? `/api/admin/services/list/${currentItem.id}`
            : '/api/admin/services/list'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.error || '保存失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (error) {
            console.error('Save error:', error)
            setToast({ show: true, type: 'error', message: '网络请求错误' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setIsSaving(false)
        }
    }


    const handleDeleteClick = (id: number) => {
        setItemToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        try {
            const res = await fetch(`/api/admin/services/list/${itemToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setItemToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleUpload = async (file: File, type: 'image' | 'icon') => {
        const formData = new FormData()
        formData.append('file', file)

        if (type === 'image') setUploadingImage(true)
        else setUploadingIcon(true)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setCurrentItem(prev => ({
                    ...prev,
                    [type]: data.url
                }))
            }
        } catch (err) {
            console.error('Upload failed:', err)
        } finally {
            if (type === 'image') setUploadingImage(false)
            else setUploadingIcon(false)
        }
    }

    // Filter logic
    const filteredItems = items.filter(item => {
        const matchesType = !filterType || item.type?.name === filterType
        const matchesKeyword = !appliedKeyword || (item.description && item.description.toLowerCase().includes(appliedKeyword.toLowerCase()))
        return matchesType && matchesKeyword
    })

    const handleSearch = () => {
        setAppliedKeyword(keyword)
    }

    const handleReset = () => {
        setFilterType('')
        setKeyword('')
        setAppliedKeyword('')
    }

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="请输入描述关键字"
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="relative">
                    <select
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700 appearance-none pr-8"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">请选择服务类型</option>
                        {types.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-[#0ea5e9] text-white px-4 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors"
                    >
                        搜索
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                        重置
                    </button>
                </div>

                <button
                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors ml-auto flex items-center gap-1 shaodw-sm"
                    onClick={() => {
                        setCurrentItem({ order: 0 })
                        setShowModal(true)
                    }}
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
                            <th className="px-4 py-3 border-r border-gray-300 w-32">服务类型</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">背景图</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">图标</th>
                            <th className="px-4 py-3 border-r border-gray-300">描述</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-16">权重</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredItems.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{item.type?.name}</td>
                                <td className="px-2 py-2 border-r border-gray-200">
                                    {item.image && (
                                        <img src={item.image} alt="Background" className="h-8 w-8 object-contain mx-auto" />
                                    )}
                                </td>
                                <td className="px-2 py-2 border-r border-gray-200">
                                    {item.icon && (
                                        <img src={item.icon} alt="Icon" className="h-8 w-8 object-contain mx-auto" />
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600 truncate max-w-xs">{item.description}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{item.order}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {item.updatedAt
                                        ? new Date(item.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
                                        : ''}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => { setCurrentItem(item); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={9} className="py-8 text-gray-400">暂无数据</td>
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
                                {currentItem.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {/* Service Type Selection */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">服务类型:</label>
                                <div className="flex-1 relative">
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] appearance-none bg-white text-gray-700"
                                        value={currentItem.typeId || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, typeId: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="" disabled>请选择服务类型</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Background Image Upload */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">背景图:</label>
                                <div className="flex-1">
                                    <div
                                        className="w-24 h-24 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] bg-white text-gray-400 hover:text-[#0ea5e9] transition-colors relative overflow-hidden"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        {currentItem.image ? (
                                            <img src={currentItem.image} alt="Background" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <>
                                                <span className="text-xl">+</span>
                                                <span className="text-xs">上传</span>
                                            </>
                                        )}
                                        {uploadingImage && <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">...</div>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleUpload(file, 'image')
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Icon Upload */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">图标:</label>
                                <div className="flex-1">
                                    <div
                                        className="w-24 h-24 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] bg-white text-gray-400 hover:text-[#0ea5e9] transition-colors relative overflow-hidden"
                                        onClick={() => iconInputRef.current?.click()}
                                    >
                                        {currentItem.icon ? (
                                            <img src={currentItem.icon} alt="Icon" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <>
                                                <span className="text-xl">+</span>
                                                <span className="text-xs">上传</span>
                                            </>
                                        )}
                                        {uploadingIcon && <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs">...</div>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={iconInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleUpload(file, 'icon')
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">描述:</label>
                                <div className="flex-1">
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入描述"
                                        value={currentItem.description || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
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
                                        value={currentItem.order || 0}
                                        onChange={e => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) })}
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
                                    disabled={isSaving}
                                    className={`bg-[#0ea5e9] text-white px-8 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors font-medium shadow-md ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? '保存中...' : '确定'}
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
                                删除该优势，页面将不再展示此内容，您确定要继续删除吗？
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

            {/* Success/Error Toast */}
            {toast.show && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in-up">
                    <div className={`${toast.type === 'success' ? 'bg-[#52c41a]' : 'bg-red-500'} text-white px-6 py-3 rounded shadow-lg flex items-center gap-2`}>
                        {toast.type === 'success' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

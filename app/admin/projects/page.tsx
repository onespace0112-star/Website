'use client'

import React, { useEffect, useState, useRef } from 'react'
import DateRangePicker from '../components/DateRangePicker'
import HeaderManager from '../components/HeaderManager'

interface ProjectType {
    id: number
    name: string
}

interface Project {
    id: number
    title: string
    typeId: number | null
    type?: ProjectType
    coverImage: string | null
    fileUrl?: string | null
    area: string | null
    location: string | null
    budgetRange?: string | null
    timeline?: string | null
    deliverables?: string | null
    order: number
    createdAt: string
    updatedAt: string | null
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [types, setTypes] = useState<ProjectType[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [filterTitle, setFilterTitle] = useState('')
    const [filterType, setFilterType] = useState('')

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentProject, setCurrentProject] = useState<Partial<Project>>({})
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const docInputRef = useRef<HTMLInputElement>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [projRes, typesRes] = await Promise.all([
                fetch('/api/admin/projects', { cache: 'no-store' }),
                fetch('/api/admin/projects/types', { cache: 'no-store' })
            ])
            const projData = await projRes.json()
            const typesData = await typesRes.json()

            if (Array.isArray(projData)) setProjects(projData)
            if (Array.isArray(typesData)) setTypes(typesData)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentProject.id && !currentProject.fileUrl) {
            setToast({ show: true, type: 'error', message: '请先上传文件' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
            return
        }
        setIsSaving(true)
        const method = currentProject.id ? 'PATCH' : 'POST'
        const url = currentProject.id
            ? `/api/admin/projects/${currentProject.id}`
            : '/api/admin/projects'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProject)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({
                    show: true,
                    type: 'error',
                    message: errorData.details || errorData.error || '保存失败'
                })
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
        setProjectToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!projectToDelete) return
        try {
            const res = await fetch(`/api/admin/projects/${projectToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setProjectToDelete(null)
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

            if (!res.ok) {
                const errorText = await res.text()
                let errorMessage = '上传失败'
                try {
                    const errorJson = JSON.parse(errorText)
                    errorMessage = errorJson.error || errorMessage
                } catch {
                    if (res.status === 413) errorMessage = '图片过大，请上传较小的图片'
                }
                throw new Error(errorMessage)
            }

            const data = await res.json()
            if (data.url) {
                setCurrentProject(prev => ({ ...prev, coverImage: data.url }))
                setToast({ show: true, type: 'success', message: '图片上传成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                throw new Error('上传返回格式错误')
            }
        } catch (err: any) {
            console.error('Upload failed:', err)
            setToast({ show: true, type: 'error', message: err.message || '图片上传失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingFile(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorMessage = '上传失败'
                try {
                    const errorJson = JSON.parse(errorText)
                    errorMessage = errorJson.error || errorMessage
                } catch {
                    if (res.status === 413) errorMessage = '文件过大，请上传较小的文件'
                }
                throw new Error(errorMessage)
            }

            const data = await res.json()
            if (data.url) {
                setCurrentProject(prev => ({ ...prev, fileUrl: data.url }))
                setToast({ show: true, type: 'success', message: '文件上传成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                throw new Error('上传返回格式错误')
            }
        } catch (err: any) {
            console.error('File upload failed:', err)
            setToast({ show: true, type: 'error', message: err.message || '文件上传失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setUploadingFile(false)
            // Reset input value to allow selecting the same file again if needed
            if (docInputRef.current) docInputRef.current.value = ''
        }
    }

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        const matchTitle = p.title.toLowerCase().includes(filterTitle.toLowerCase())
        const matchType = filterType ? p.typeId?.toString() === filterType : true
        // Date filter is visual-only for now as per previous DateRangePicker implementation status
        return matchTitle && matchType
    }).sort((a, b) => {
        // First sort by type name
        const typeA = a.type?.name || ''
        const typeB = b.type?.name || ''
        const typeCompare = typeA.localeCompare(typeB)

        // If types are same, sort by id (or whatever secondary sort you prefer)
        if (typeCompare !== 0) return typeCompare
        return a.id - b.id
    })

    // Locations for dropdown
    const locations = [
        "Dubai, United Arab Emirates",
        "Abu Dhabi, United Arab Emirates",
        "Shaqra, United Arab Emirates",
        "Riyadh, Saudi Arabia",
        "Jeddah, Saudi Arabia",
        "Dammam, Saudi Arabia",
        "Doha, Qatar",
        "Kuwait City, Kuwait",
        "Manama, Bahrain",
        "Muscat, Oman",
        "Salem, Oman",
        "Sana'a, Yemen",
        "Aden, Yemen",
        "Amman, Jordan",
        "Aqaba, Jordan",
        "Beirut, Lebanon",
        "Tripoli, Lebanon",
        "Damascus, Syria",
        "Aleppo, Syria",
        "Baghdad, Iraq",
        "Basra, Iraq",
        "Elbil, Iraq",
        "Tehran, Iran",
        "Isfahan, Iran",
        "Shiraz, Iran",
        "Jerusalem, Israel",
        "Tel Aviv, Israel",
        "Haifa, Israel",
        "Ramallah, Palestine",
        "Gaza, Palestine",
        "Istanbul, Turkey",
        "Ankara, Turkey",
        "Izmir, Turkey",
        "Paris, France",
        "Lyon, France",
        "Marseille, France",
        "London, United Kingdom",
        "Manchester, United Kingdom",
        "Birmingham, United Kingdom",
        "Berlin, Germany",
        "Munich, Germany",
        "Frankfurt, Germany",
        "Hamburg, Germany",
        "Rome, Italy",
        "Milan, Italy",
        "Florence, Italy",
        "Venice, Italy",
        "Madrid, Spain",
        "Barcelona, Spain",
        "Valencia, Spain",
        "Lisbon, Portugal",
        "Porto, Portugal",
        "Amsterdam, Netherlands",
        "Rotterdam, Netherlands",
        "The Hague, Netherlands",
        "Brussels, Belgium",
        "Antwerp, Belgium",
        "Ghent, Belgium",
        "Zurich, Switzerland",
        "Geneva, Switzerland",
        "Bern, Switzerland",
        "Vienna, Austria",
        "Salzburg, Austria",
        "Graz, Austria",
        "Stockholm, Sweden",
        "Gothenburg, Sweden",
        "Malmö, Sweden",
        "Oslo, Norway",
        "Bergen, Norway",
        "Copenhagen, Denmark",
        "Aarhus, Denmark",
        "Helsinki, Finland",
        "Tampere, Finland",
        "Odessa, Ukraine",
        "Lviv, Ukraine",
        "Lwow, Ukraine",
        "Moscow, Russia",
        "Saint Petersburg, Russia",
        "Reykjavik, Iceland"
    ]

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex items-center">
                    <label className="mr-2 text-sm font-bold text-gray-700">项目名称:</label>
                    <input
                        type="text"
                        placeholder="请输入项目名称"
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                        value={filterTitle}
                        onChange={(e) => setFilterTitle(e.target.value)}
                    />
                </div>

                <div className="flex items-center">
                    <label className="mr-2 text-sm font-bold text-gray-700">项目类型:</label>
                    <div className="relative">
                        <select
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700 appearance-none pr-8"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">请选择项目类型</option>
                            {types.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <label className="mr-2 text-sm font-bold text-gray-700">选择时间:</label>
                    <DateRangePicker />
                </div>

                <button
                    className="bg-[#d4d4d4] hover:bg-gray-400 text-gray-800 px-6 py-1.5 rounded text-sm transition-colors"
                >
                    搜索
                </button>
                <button
                    className="bg-[#b48b3e] hover:bg-[#9a7633] text-white px-6 py-1.5 rounded text-sm transition-colors"
                    onClick={() => { setFilterTitle(''); setFilterType(''); }}
                >
                    重置
                </button>

                <button
                    onClick={() => {
                        setCurrentProject({ order: 0 })
                        setShowModal(true)
                    }}
                    className="ml-auto bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors flex items-center gap-1 shadow-sm"
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
                            <th className="px-4 py-3 border-r border-gray-300">项目类型</th>
                            <th className="px-4 py-3 border-r border-gray-300">项目名称</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-24">项目图片</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-28">文件</th>
                            <th className="px-4 py-3 border-r border-gray-300">项目面积</th>
                            <th className="px-4 py-3 border-r border-gray-300">项目地点</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProjects.map((p, index) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{p.type?.name || '-'}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{p.title}</td>
                                <td className="px-2 py-2 border-r border-gray-200">
                                    {p.coverImage && (
                                        <img src={p.coverImage} alt="Cover" className="h-10 w-16 object-cover mx-auto rounded-sm border border-gray-200" />
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                    {p.fileUrl ? (
                                        <a
                                            href={p.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0ea5e9] hover:text-[#0284c7] underline"
                                        >
                                            查看文件
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{p.area || '-'}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{p.location || '-'}</td>
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
                                            onClick={() => { setCurrentProject(p); setShowModal(true); }}
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
                        {filteredProjects.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-8 text-gray-400">暂无数据</td>
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
                                {currentProject.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {/* Type */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">项目类型:</label>
                                <div className="flex-1 relative">
                                    <select
                                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] appearance-none"
                                        value={currentProject.typeId || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, typeId: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="">请选择项目类型</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">项目名称:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入标题"
                                        value={currentProject.title || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">项目图片:</label>
                                <div className="flex-1">
                                    <div
                                        className="w-24 h-24 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] bg-white text-gray-400 hover:text-[#0ea5e9] transition-colors relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {currentProject.coverImage ? (
                                            <img src={currentProject.coverImage} alt="Cover" className="w-full h-full object-cover" />
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

                            {/* File Upload */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">文件:</label>
                                <div className="flex-1 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => docInputRef.current?.click()}
                                        className="bg-white border border-gray-300 px-3 py-2 rounded text-sm text-gray-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors"
                                    >
                                        {uploadingFile ? '上传中...' : '点击上传'}
                                    </button>
                                    {currentProject.fileUrl && (
                                        <a
                                            href={currentProject.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0ea5e9] hover:text-[#0284c7] underline text-sm truncate max-w-[220px]"
                                        >
                                            已上传文件
                                        </a>
                                    )}
                                    {!currentProject.fileUrl && <span className="text-gray-400 text-sm">未上传</span>}
                                    <input
                                        type="file"
                                        ref={docInputRef}
                                        className="hidden"
                                        onChange={handleDocFileChange}
                                    />
                                </div>
                            </div>

                            {/* Area */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">项目面积:</label>
                                <div className="flex-1 flex items-center">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入项目面积"
                                        value={currentProject.area || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, area: e.target.value })}
                                    />
                                    <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-3 py-2 text-sm text-gray-600">
                                        m²
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">项目地点:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="请输入项目地点，如：Aleppo, Syria"
                                        value={currentProject.location || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Budget Range */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">预算区间:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="例如：USD 80,000 - 120,000"
                                        value={currentProject.budgetRange || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, budgetRange: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex items-center">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">交付周期:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="例如：4-6 个月"
                                        value={currentProject.timeline || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, timeline: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Deliverables */}
                            <div className="flex items-start">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">交付成果:</label>
                                <div className="flex-1">
                                    <textarea
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                        placeholder="每行一条，例如：设计语言转可执行清单"
                                        rows={3}
                                        value={currentProject.deliverables || ''}
                                        onChange={e => setCurrentProject({ ...currentProject, deliverables: e.target.value })}
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
                                        value={currentProject.order || 0}
                                        onChange={e => setCurrentProject({ ...currentProject, order: parseInt(e.target.value) })}
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
                                    {isSaving ? '保存中...' : '保存'}
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
                                删除该案例，页面将不再展示此内容，您确定要继续删除吗？
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

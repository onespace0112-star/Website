'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, X, Upload, FileText, Loader2, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'

type StyleItem = {
    id: number
    styleId: number
    title: string
    imageUrl: string
    pageNum: number
    sortOrder: number
}

type Style = {
    id: number
    name: string
    fileUrl: string
    fileName: string
    sortOrder: number
    createdAt: string
    items: StyleItem[]
}

const API = '/api/admin/products/styles'
const EXTRACT_API = '/api/admin/products/styles/extract'
const ITEMS_API = '/api/admin/products/styles/items'

const formatDate = (d: string) =>
    new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

const isPDF = (url: string) => url?.toLowerCase().endsWith('.pdf')
const isZip = (url: string) => url?.toLowerCase().endsWith('.zip')
const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(url)

export default function ProductStylesPage() {
    const [styles, setStyles] = useState<Style[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [form, setForm] = useState({ name: '', nameZh: '', sortOrder: 0, fileUrl: '', fileName: '' })
    const [uploading, setUploading] = useState(false)
    const [extractingId, setExtractingId] = useState<number | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [editingItem, setEditingItem] = useState<{ id: number; title: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const folderInputRef = useRef<HTMLInputElement>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(API)
            if (res.ok) setStyles(await res.json())
        } catch { }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => {
        setEditId(null)
        setForm({ name: '', nameZh: '', sortOrder: 0, fileUrl: '', fileName: '' })
        setShowModal(true)
    }

    const openEdit = (s: Style) => {
        setEditId(s.id)
        setForm({ name: s.name, nameZh: (s as any).nameZh || '', sortOrder: s.sortOrder, fileUrl: s.fileUrl || '', fileName: s.fileName || '' })
        setShowModal(true)
    }

    const handleFileUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        setUploading(true)
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.url) setForm(f => ({ ...f, fileUrl: data.url, fileName: file.name }))
        } catch { } finally { setUploading(false) }
    }

    const handleFolderUpload = async (files: FileList) => {
        const imageFiles = Array.from(files).filter(f => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(f.name))
        if (imageFiles.length === 0) {
            alert('文件夹中没有找到有效的图片文件')
            return
        }

        const formData = new FormData()
        imageFiles.forEach(f => formData.append('files', f))

        setUploading(true)
        try {
            const res = await fetch('/api/upload/folder', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.url) setForm(f => ({ ...f, fileUrl: data.url, fileName: 'FOLDER-UPLOAD.zip' }))
        } catch (e: any) {
            alert('上传失败')
        } finally { setUploading(false) }
    }

    const removeFile = () => setForm(f => ({ ...f, fileUrl: '', fileName: '' }))

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return
        const method = editId ? 'PATCH' : 'POST'
        const body = editId ? { id: editId, ...form } : form
        await fetch(API, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        setShowModal(false)
        fetchData()
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`确定要删除产品风格「${name}」吗？`)) return
        await fetch(API, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        fetchData()
    }

    const handleExtract = async (styleId: number, name: string) => {
        const style = styles.find(s => s.id === styleId)
        const isPdfFile = style && isPDF(style.fileUrl)
        const isZipFile = style && isZip(style.fileUrl)

        if (!confirm(`确定要解析「${name}」的${isPdfFile ? 'PDF' : 'ZIP'}文件？这将清除现有产品图片并重新提取。`)) return
        setExtractingId(styleId)
        try {
            const res = await fetch(EXTRACT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ styleId }),
            })
            const data = await res.json()
            if (res.ok) {
                alert(`解析完成，共提取 ${data.count} 张产品图片`)
                setExpandedId(styleId)
                fetchData()
            } else {
                alert(`解析失败：${data.error}`)
            }
        } catch (e: any) {
            alert(`解析失败：${e.message}`)
        } finally {
            setExtractingId(null)
        }
    }

    const handleDeleteItem = async (id: number) => {
        if (!confirm('确定要删除这张产品图片吗？')) return
        await fetch(ITEMS_API, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        fetchData()
    }

    const handleSaveItemTitle = async () => {
        if (!editingItem) return
        await fetch(ITEMS_API, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingItem.id, title: editingItem.title }),
        })
        setEditingItem(null)
        fetchData()
    }

    const renderFileCell = (url: string, name: string) => {
        if (!url) return <span className="text-gray-300 text-xs">—</span>
        if (isPDF(url)) return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0ea5e9] hover:underline text-xs" title={name}>
                <FileText className="w-4 h-4" /><span className="max-w-[120px] truncate">{name || 'PDF文件'}</span>
            </a>
        )
        if (isZip(url)) return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0ea5e9] hover:underline text-xs" title={name}>
                <FileText className="w-4 h-4 text-amber-500" /><span className="max-w-[120px] truncate">{name || 'ZIP文件'}</span>
            </a>
        )
        if (isImage(url)) return (
            <a href={url} target="_blank" rel="noopener noreferrer" title={name}>
                <img src={url} alt={name} className="h-10 w-10 object-cover rounded border border-gray-200" />
            </a>
        )
        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#0ea5e9] hover:underline text-xs">{name || '文件'}</a>
    }

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-2xl font-bold text-gray-800">产品分类管理</h1>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[#0ea5e9]">产品分类</h2>
                    <button onClick={openCreate} className="flex items-center gap-1 text-sm text-[#0ea5e9] hover:text-[#0284c7] font-medium cursor-pointer">
                        <Plus className="w-4 h-4" /> 新建分类
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                            <tr>
                                <th className="px-6 py-3 w-12">序号</th>
                                <th className="px-6 py-3">产品分类（英文）</th>
                                <th className="px-6 py-3">产品分类（中文）</th>
                                <th className="px-6 py-3">产品文件</th>
                                <th className="px-6 py-3 w-16 text-center">权重</th>
                                <th className="px-6 py-3">提交时间</th>
                                <th className="px-6 py-3 text-center w-52">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-6 text-center text-gray-400">加载中...</td></tr>
                            ) : styles.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-6 text-center text-gray-400">暂无数据</td></tr>
                            ) : styles.map((s, i) => (
                                <React.Fragment key={s.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-3 text-gray-800 font-medium">{s.name}</td>
                                        <td className="px-6 py-3 text-gray-600">{(s as any).nameZh || <span className="text-gray-300 text-xs">—</span>}</td>
                                        <td className="px-6 py-3">{renderFileCell(s.fileUrl, s.fileName)}</td>
                                        <td className="px-6 py-3 text-center text-gray-600">{s.sortOrder}</td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                                        <td className="px-6 py-3 text-center flex items-center justify-center gap-2">
                                            {(isPDF(s.fileUrl) || isZip(s.fileUrl)) && (
                                                <button
                                                    onClick={() => handleExtract(s.id, s.name)}
                                                    disabled={extractingId === s.id}
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded cursor-pointer disabled:opacity-60"
                                                >
                                                    {extractingId === s.id
                                                        ? <><Loader2 className="w-3 h-3 animate-spin" />解析中</>
                                                        : isPDF(s.fileUrl) ? '解析PDF' : '解析ZIP'}
                                                </button>
                                            )}
                                            {(s.items?.length ?? 0) > 0 && (
                                                <button
                                                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                                                >
                                                    {expandedId === s.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    {expandedId === s.id ? '收起' : '查看'}
                                                </button>
                                            )}
                                            <button onClick={() => openEdit(s)} className="text-[#0ea5e9] hover:underline text-sm cursor-pointer">编辑</button>
                                            <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 hover:underline text-sm cursor-pointer">删除</button>
                                        </td>
                                    </tr>
                                    {expandedId === s.id && s.items?.length > 0 && (
                                        <tr key={`${s.id}-items`}>
                                            <td colSpan={6} className="bg-gray-50 px-6 py-4">
                                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                    {s.items.map(item => (
                                                        <div key={item.id} className="relative group border border-gray-200 rounded overflow-hidden bg-white">
                                                            <img src={item.imageUrl} alt={item.title} className="w-full aspect-[3/4] object-cover" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                                                <button
                                                                    onClick={() => setEditingItem({ id: item.id, title: item.title })}
                                                                    className="text-white bg-blue-500/80 hover:bg-blue-600 rounded px-2 py-0.5 text-xs cursor-pointer"
                                                                >
                                                                    改标题
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="text-white bg-red-500/80 hover:bg-red-600 rounded px-2 py-0.5 text-xs cursor-pointer"
                                                                >
                                                                    删除
                                                                </button>
                                                            </div>
                                                            <div className="p-1 text-[10px] text-gray-500 truncate" title={item.title}>
                                                                {item.title || `第${item.pageNum}页`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit item title modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
                    <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6 space-y-4">
                        <h3 className="font-semibold text-gray-800">修改产品标题</h3>
                        <input
                            value={editingItem.title}
                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                            placeholder="请输入产品标题"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">取消</button>
                            <button onClick={handleSaveItemTitle} className="px-4 py-2 text-sm bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7] cursor-pointer">确定</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Style form modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#0ea5e9] text-white">
                            <h3 className="font-semibold">{editId ? '编辑产品分类' : '新建产品分类'}</h3>
                            <button onClick={() => setShowModal(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">英文名称</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="请输入英文名称"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">中文名称</label>
                                <input
                                    value={form.nameZh}
                                    onChange={e => setForm({ ...form, nameZh: e.target.value })}
                                    placeholder="请输入中文名称"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                />
                            </div>
                            <div className="flex items-start gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0 pt-2">产品文件</label>
                                <div className="flex-1">
                                    {form.fileUrl ? (
                                        <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-2">
                                            {isImage(form.fileUrl)
                                                ? <img src={form.fileUrl} alt="" className="h-12 w-12 object-cover rounded" />
                                                : <FileText className="w-8 h-8 text-red-500 shrink-0" />}
                                            <span className="text-sm text-gray-700 truncate flex-1" title={form.fileName}>{form.fileName || '已上传文件'}</span>
                                            <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex-1 border border-dashed border-gray-300 rounded px-2 py-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-colors"
                                            >
                                                {uploading
                                                    ? <span className="text-sm text-gray-400">上传中...</span>
                                                    : <><Upload className="w-6 h-6 text-gray-400 mb-1" /><span className="text-[10px] text-gray-400">上传文件 (PDF/PNG)</span></>}
                                            </div>
                                            <div
                                                onClick={() => folderInputRef.current?.click()}
                                                className="flex-1 border border-dashed border-gray-300 rounded px-2 py-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-colors"
                                            >
                                                {uploading
                                                    ? <span className="text-sm text-gray-400">上传中...</span>
                                                    : <><Plus className="w-6 h-6 text-gray-400 mb-1" /><span className="text-[10px] text-gray-400">上传文件夹</span></>}
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileUpload(file)
                                            e.target.value = ''
                                        }}
                                    />
                                    <input
                                        ref={folderInputRef}
                                        type="file"
                                        className="hidden"
                                        {...({ webkitdirectory: '', directory: '' } as any)}
                                        onChange={(e) => {
                                            const files = e.target.files
                                            if (files) handleFolderUpload(files)
                                            e.target.value = ''
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-700 w-20 shrink-0">权重</label>
                                <input
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                                    placeholder="请输入权重"
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                />
                            </div>
                            <div className="flex justify-center gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">取消</button>
                                <button type="submit" className="px-6 py-2 text-sm bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7] cursor-pointer">确定</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

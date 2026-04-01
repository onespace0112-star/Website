'use client'

import React, { useState, useEffect, useRef } from 'react'

interface CompanyIntro {
    id: number
    fileUrl: string
    createdAt: string
    updatedAt: string | null
}

export default function CompanyIntroPage() {
    const [items, setItems] = useState<CompanyIntro[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [uploading, setUploading] = useState(false)
    const [fileName, setFileName] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    const fetchItems = async () => {
        const res = await fetch('/api/admin/company-intro')
        if (res.ok) setItems(await res.json())
    }
    useEffect(() => { fetchItems() }, [])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setFileName(file.name)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            if (res.ok) {
                const data = await res.json()
                setFileUrl(data.url || data.fileUrl || '')
            }
        } finally { setUploading(false) }
    }

    const handleSave = async () => {
        if (!fileUrl) return alert('请先上传文件')
        if (editId) {
            await fetch(`/api/admin/company-intro/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl })
            })
        } else {
            await fetch('/api/admin/company-intro', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl })
            })
        }
        setShowModal(false)
        setEditId(null)
        setFileUrl('')
        setFileName('')
        fetchItems()
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确认删除？')) return
        await fetch(`/api/admin/company-intro/${id}`, { method: 'DELETE' })
        fetchItems()
    }

    const handleEdit = (item: CompanyIntro) => {
        setEditId(item.id)
        setFileUrl(item.fileUrl)
        setFileName(item.fileUrl.split('/').pop() || '')
        setShowModal(true)
    }

    const openAdd = () => {
        setEditId(null)
        setFileUrl('')
        setFileName('')
        setShowModal(true)
    }

    const fmtDate = (d: string | null) => {
        if (!d) return '-'
        return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '/')
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">公司简介</h1>
            <div className="flex justify-end mb-4">
                <button onClick={openAdd} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">+ 添加</button>
            </div>
            <table className="w-full border-collapse border border-gray-300 bg-white">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">序号</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">文件</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">创建时间</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">更新时间</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">{i + 1}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">
                                <a href={item.fileUrl} target="_blank" className="text-blue-500 hover:underline">{item.fileUrl.split('/').pop()}</a>
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">{fmtDate(item.createdAt)}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">{fmtDate(item.updatedAt)}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">
                                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:underline mr-3">编辑</button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">删除</button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-400">暂无数据</td></tr>}
                </tbody>
            </table>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-96 overflow-hidden">
                        <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
                            <span className="font-bold">{editId ? '编辑' : '添加'}</span>
                            <button onClick={() => setShowModal(false)} className="text-white text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="font-bold text-sm">文件：</span>
                                <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" />
                                <button onClick={() => fileRef.current?.click()} className="border border-blue-400 text-blue-500 px-4 py-1 rounded text-sm hover:bg-blue-50" disabled={uploading}>
                                    {uploading ? '上传中...' : '点击上传'}
                                </button>
                                <span className="text-sm text-gray-500">{fileName || '未上传'}</span>
                            </div>
                            <div className="flex justify-center gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">取消</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">保存</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

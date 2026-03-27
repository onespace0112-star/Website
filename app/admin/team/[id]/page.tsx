'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import FileUpload from '@/components/FileUpload'

export default function TeamMemberEditPage() {
    const router = useRouter()
    const params = useParams()
    const isNew = params.id === 'new'

    const [form, setForm] = useState({
        name: '',
        position: '',
        image: '',
        serviceMotion: '',
        pastCases: '',
        order: 0
    })
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/team/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error)
                        router.push('/admin/team')
                        return
                    }
                    setForm({
                        name: data.name || '',
                        position: data.position || '',
                        image: data.image || '',
                        serviceMotion: data.serviceMotion || '',
                        pastCases: data.pastCases || '',
                        order: data.order || 0
                    })
                    setLoading(false)
                })
                .catch(err => {
                    console.error('Failed to fetch team member:', err)
                    setLoading(false)
                })
        }
    }, [params.id, isNew, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const method = isNew ? 'POST' : 'PUT'
        const url = isNew ? '/api/team' : `/api/team/${params.id}`

        try {
            const res = await fetch(url, {
                method,
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.ok) {
                router.push('/admin/team')
            } else {
                const data = await res.json()
                alert(data.error || '保存失败')
                setSaving(false)
            }
        } catch (error) {
            alert('保存过程中发生错误')
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">正在加载...</div>

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">{isNew ? '新增成员' : '编辑成员'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start py-4">
                    <div className="flex-shrink-0">
                        <label className="block text-sm font-semibold mb-3 text-gray-700">成员头像</label>
                        <FileUpload
                            onUploadSuccess={(url) => setForm({ ...form, image: url })}
                        >
                            <div className="relative group cursor-pointer">
                                {form.image ? (
                                    <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm transition-all group-hover:border-black group-hover:shadow-md">
                                        <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold tracking-wider">更换头像</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 transition-all group-hover:bg-gray-100 group-hover:border-gray-300">
                                        <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">上传图片</span>
                                    </div>
                                )}
                                {form.image && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setForm({ ...form, image: '' });
                                        }}
                                        className="absolute -top-2 -right-2 h-6 w-6 bg-white border shadow-sm text-gray-400 rounded-full flex items-center justify-center hover:text-red-500 hover:border-red-100 transition-all z-10"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </FileUpload>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">姓名</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-md border-gray-200 bg-gray-50/50 shadow-sm focus:border-black focus:ring-0 border px-3 py-2 text-sm transition-colors hover:bg-white focus:bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">职位</label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={e => setForm({ ...form, position: e.target.value })}
                                    className="w-full rounded-md border-gray-200 bg-gray-50/50 shadow-sm focus:border-black focus:ring-0 border px-3 py-2 text-sm transition-colors hover:bg-white focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">图片 URL (可选)</label>
                            <input
                                type="text"
                                value={form.image}
                                onChange={e => setForm({ ...form, image: e.target.value })}
                                className="w-full rounded-md border-gray-100 bg-gray-50/30 px-3 py-1.5 text-xs text-gray-500 italic focus:outline-none focus:border-gray-200 focus:bg-white transition-all border"
                                placeholder="或在此处直接粘贴图片地址"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">服务宗旨</label>
                    <textarea
                        value={form.serviceMotion}
                        onChange={e => setForm({ ...form, serviceMotion: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        rows={3}
                        placeholder="请输入服务宗旨..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">过往案例 (支持 HTML)</label>
                    <textarea
                        value={form.pastCases}
                        onChange={e => setForm({ ...form, pastCases: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm font-mono"
                        rows={8}
                        placeholder="请输入过往案例详情，支持 HTML 标签..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">排序 (数字越小越靠前)</label>
                    <input
                        type="number"
                        value={form.order}
                        onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                        className="w-32 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                    >
                        {saving ? '正在保存...' : (isNew ? '创建' : '保存修改')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/team')}
                        className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    )
}

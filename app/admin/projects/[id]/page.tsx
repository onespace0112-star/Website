'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ProjectEditPage() {
    const router = useRouter()
    const params = useParams()
    const isNew = params.id === 'new'

    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        coverImage: '',
        content: '',
        budgetRange: '',
        timeline: '',
        deliverables: ''
    })
    const [loading, setLoading] = useState(!isNew)

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/projects/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        title: data.title || '',
                        slug: data.slug || '',
                        description: data.description || '',
                        coverImage: data.coverImage || '',
                        content: data.content || '',
                        budgetRange: data.budgetRange || '',
                        timeline: data.timeline || '',
                        deliverables: data.deliverables || ''
                    })
                    setLoading(false)
                })
        }
    }, [params.id, isNew])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = isNew ? 'POST' : 'PUT'
        const url = isNew ? '/api/projects' : `/api/projects/${params.id}`

        await fetch(url, {
            method,
            body: JSON.stringify(form),
            headers: { 'Content-Type': 'application/json' }
        })

        router.push('/admin/projects')
    }

    if (loading) return <div className="p-8 text-gray-500">正在加载项目详情...</div>

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
                <h1 className="text-2xl font-bold">{isNew ? '新建项目' : '编辑项目'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">标题</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Slug (URL 标识)</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={e => setForm({ ...form, slug: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                            required
                            placeholder="例如: case-uae-villa-001"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">描述</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        rows={3}
                        placeholder="请输入项目的简短描述..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">封面图片 URL</label>
                    <input
                        type="text"
                        value={form.coverImage}
                        onChange={e => setForm({ ...form, coverImage: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        placeholder="例如: /assets/projects/cover.jpg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">内容 (支持 HTML)</label>
                    <textarea
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm font-mono"
                        rows={12}
                        placeholder="在此处编写项目详情内容，支持 HTML 标签..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">预算区间</label>
                        <input
                            type="text"
                            value={form.budgetRange}
                            onChange={e => setForm({ ...form, budgetRange: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                            placeholder="例如：USD 80,000 - 120,000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">交付周期</label>
                        <input
                            type="text"
                            value={form.timeline}
                            onChange={e => setForm({ ...form, timeline: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                            placeholder="例如：4-6 个月"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">交付成果 (每行一条)</label>
                    <textarea
                        value={form.deliverables}
                        onChange={e => setForm({ ...form, deliverables: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        rows={4}
                        placeholder="例如：\n设计语言转可执行清单\n出货前 QC 证据链\n到场/安装协调与验收"
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <button type="submit" className="rounded-md bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors">
                        {isNew ? '创建' : '保存修改'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                        取消
                    </button>
                </div>
            </form>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function FAQEditPage() {
    const router = useRouter()
    const params = useParams()
    const faqId = Array.isArray(params.id) ? params.id[0] : params.id
    const isNew = faqId === 'new'

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: '',
        order: 0
    })
    const [loading, setLoading] = useState(!isNew)

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/admin/faq/${faqId}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        question: data.question || '',
                        answer: data.answer || '',
                        category: data.category || '',
                        order: data.order || 0
                    })
                    setLoading(false)
                })
        }
    }, [faqId, isNew])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = isNew ? 'POST' : 'PATCH'
        const url = isNew ? '/api/admin/faq' : `/api/admin/faq/${faqId}`

        await fetch(url, {
            method,
            body: JSON.stringify(form),
            headers: { 'Content-Type': 'application/json' }
        })

        router.push('/admin/faq')
    }

    if (loading) return <div className="p-8 text-gray-500">正在加载问题详情...</div>

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
                <h1 className="text-2xl font-bold">{isNew ? '新建问题' : '编辑问题'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 bg-white p-6 rounded-lg border shadow-sm">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">问题</label>
                    <input
                        type="text"
                        value={form.question}
                        onChange={e => setForm({ ...form, question: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        required
                        placeholder="请输入问题描述..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">答案</label>
                    <textarea
                        value={form.answer}
                        onChange={e => setForm({ ...form, answer: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        rows={8}
                        required
                        placeholder="请输入该问题的详细解答..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">分类 (可选)</label>
                        <input
                            type="text"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                            placeholder="例如: 交付、费用、流程"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">排序 (数字越小越靠前)</label>
                        <input
                            type="number"
                            value={form.order}
                            onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black border p-2 text-sm"
                        />
                    </div>
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

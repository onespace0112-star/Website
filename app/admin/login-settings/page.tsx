'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Save } from 'lucide-react'

interface LegalDoc {
    id: number
    type: string
    fileUrl: string
    fileName: string
    content: string
    updatedAt: string
}

export default function LoginSettingsPage() {
    const [docs, setDocs] = useState<LegalDoc[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)
    const [saving, setSaving] = useState<string | null>(null)
    const [editContent, setEditContent] = useState<Record<string, string>>({})
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' })

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/legal-documents', { cache: 'no-store' })
            if (res.ok) {
                const data: LegalDoc[] = await res.json()
                setDocs(data)
                // 初始化编辑内容
                const contents: Record<string, string> = {}
                data.forEach(d => { contents[d.type] = d.content || '' })
                setEditContent(prev => {
                    const merged = { ...prev }
                    data.forEach(d => {
                        if (merged[d.type] === undefined) merged[d.type] = d.content || ''
                    })
                    return merged
                })
            }
        } catch {
            console.error('Failed to fetch legal documents')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const getDoc = (type: string) => docs.find(d => d.type === type)

    // 文件上传（自动读取 .md/.txt 内容）
    const handleUpload = async (type: string, file: File) => {
        setUploading(type)
        try {
            // 如果是 markdown/文本文件，读取内容
            const ext = file.name.split('.').pop()?.toLowerCase() || ''
            let textContent = ''
            if (['md', 'txt', 'text', 'markdown'].includes(ext)) {
                textContent = await file.text()
            }

            // 上传文件
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            if (!uploadRes.ok) {
                showToast('error', `文件上传失败: ${uploadRes.status}`)
                return
            }
            const uploadData = await uploadRes.json()
            const url = uploadData.url
            if (!url) { showToast('error', '上传返回数据异常'); return }

            // 保存到数据库（含内容）
            const saveRes = await fetch('/api/admin/legal-documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    fileUrl: url,
                    fileName: file.name,
                    ...(textContent ? { content: textContent } : {}),
                }),
            })

            if (!saveRes.ok) {
                showToast('error', `保存失败: ${saveRes.status}`)
                return
            }

            if (textContent) {
                setEditContent(prev => ({ ...prev, [type]: textContent }))
            }
            showToast('success', '上传成功' + (textContent ? '，内容已提取' : ''))
            fetchData()
        } catch {
            showToast('error', '操作失败')
        } finally {
            setUploading(null)
        }
    }

    // 保存编辑的文本内容
    const handleSaveContent = async (type: string) => {
        setSaving(type)
        try {
            const res = await fetch('/api/admin/legal-documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content: editContent[type] || '' }),
            })
            if (res.ok) {
                showToast('success', '内容已保存')
                fetchData()
            } else {
                const errData = await res.json().catch(() => ({}))
                showToast('error', `保存失败: ${res.status} ${errData.error || errData.detail || ''}`)
            }
        } catch {
            showToast('error', '操作失败')
        } finally {
            setSaving(null)
        }
    }

    const triggerUpload = (type: string) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.md,.txt,.pdf,.doc,.docx'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) handleUpload(type, file)
        }
        input.click()
    }

    const sections = [
        {
            label: '服务条款',
            description: '用户在注册/登录时需同意的服务条款。支持直接编辑 Markdown 内容，或上传 .md 文件自动提取。',
            slots: [
                { type: 'terms_en', lang: '英文版' },
                { type: 'terms_zh', lang: '中文版' },
            ],
        },
        {
            label: '隐私政策',
            description: '用户在注册/登录时需同意的隐私政策。支持直接编辑 Markdown 内容，或上传 .md 文件自动提取。',
            slots: [
                { type: 'privacy_en', lang: '英文版' },
                { type: 'privacy_zh', lang: '中文版' },
            ],
        },
    ]

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-[#0ea5e9] rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-black mb-2">登录管理</h1>
            <p className="text-gray-500 text-sm mb-8">管理用户登录页面的服务条款和隐私政策，内容将直接展示在前台页面。</p>

            <div className="grid gap-6">
                {sections.map(({ label, description, slots }) => (
                    <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0ea5e9]" />
                                {label}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">{description}</p>
                        </div>

                        <div className="grid gap-5">
                            {slots.map(({ type, lang }) => {
                                const doc = getDoc(type)
                                const isUploading = uploading === type
                                const isSaving = saving === type
                                const currentContent = editContent[type] ?? doc?.content ?? ''
                                const hasChanges = currentContent !== (doc?.content || '')

                                return (
                                    <div key={type} className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-black text-sm font-medium">{lang}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => triggerUpload(type)}
                                                    disabled={isUploading}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    {isUploading ? '上传中...' : '上传 .md 文件'}
                                                </button>
                                                <button
                                                    onClick={() => handleSaveContent(type)}
                                                    disabled={isSaving || !hasChanges}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#0ea5e9] rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    {isSaving ? '保存中...' : '保存内容'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Markdown 编辑区 */}
                                        <textarea
                                            value={currentContent}
                                            onChange={(e) => setEditContent(prev => ({ ...prev, [type]: e.target.value }))}
                                            placeholder="在此输入 Markdown 格式的内容，如：&#10;# 标题&#10;## 子标题&#10;正文内容..."
                                            className="w-full h-48 p-3 text-sm text-black bg-white border border-gray-200 rounded-lg resize-y font-mono focus:outline-none focus:border-[#0ea5e9] transition-colors"
                                        />

                                        {/* 文件信息 */}
                                        {doc?.fileName && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                已关联文件: {doc.fileName} · 更新于 {new Date(doc.updatedAt).toLocaleString('zh-CN')}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-lg text-white text-sm shadow-lg transition-all ${toast.type === 'success' ? 'bg-[#52c41a]' : 'bg-red-500'
                    }`}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminAIConfigPage() {
    const [config, setConfig] = useState({
        apiKey: '',
        hasKey: false,
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        systemPrompt: '',
    })
    const [newKey, setNewKey] = useState('')
    const [newProvider, setNewProvider] = useState('gemini')
    const [newModel, setNewModel] = useState('gemini-2.0-flash')
    const [newPrompt, setNewPrompt] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/ai-config')
            if (res.ok) {
                const data = await res.json()
                setConfig(data)
                setNewPrompt(data.systemPrompt || '')
                setNewProvider(data.provider || 'gemini')
                setNewModel(data.model || (data.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash'))
            }
        } catch (e) {
            console.error('Failed to fetch config', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!config.hasKey && !newKey.trim()) {
            setToast({ show: true, type: 'error', message: '请输入 API Key' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            return
        }

        setSaving(true)

        try {
            const res = await fetch('/api/admin/ai-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: newKey,
                    provider: newProvider,
                    model: newModel,
                    systemPrompt: newPrompt,
                }),
            })

            if (res.ok) {
                setToast({ show: true, type: 'success', message: '配置保存成功！' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
                setNewKey('')
                await fetchConfig()
            } else {
                setToast({ show: true, type: 'error', message: '保存失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (e) {
            console.error('Save failed', e)
            setToast({ show: true, type: 'error', message: '保存失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-black">加载中...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-black">
            <h1 className="text-2xl font-bold mb-8">AI 智能助手配置</h1>

            <div className="max-w-3xl bg-white rounded-lg shadow p-6">
                {/* Status */}
                <div className="mb-8">
                    <p className="font-semibold mb-2">当前状态</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.hasKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-700">{config.hasKey ? `已配置 (${config.provider || 'gemini'})` : '未配置'}</span>
                    </div>
                </div>

                {/* Provider */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">模型供应商</label>
                    <select
                        value={newProvider}
                        onChange={(e) => {
                            const nextProvider = e.target.value
                            setNewProvider(nextProvider)
                            setNewModel(nextProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash')
                        }}
                        className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 text-black"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">可随时切换供应商与模型</p>
                </div>

                {/* Model */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">模型名称</label>
                    <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder={newProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash'}
                        className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 text-black placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">示例：OpenAI 使用 gpt-4o-mini / Gemini 使用 gemini-2.0-flash</p>
                </div>

                {/* API Key */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                        type="password"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder={config.hasKey ? "已隐藏 (输入新 Key 以覆盖)" : "输入 API Key"}
                        className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 text-black placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">OpenAI / Google AI Studio 获取 API Key</p>
                </div>

                {/* System Prompt */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt (系统提示词)</label>
                    <textarea
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        className="w-full border p-3 rounded-lg h-40 outline-none focus:border-blue-500 text-black scrollbar-hide"
                        placeholder="定义 AI 的行为、语气和角色..."
                    />
                </div>

                {/* Save Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 ${saving ? 'cursor-not-allowed' : ''}`}
                    >
                        {saving ? '保存中...' : '保存所有配置'}
                    </button>
                </div>
            </div>

            {/* Toast */}
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

            <div className="mt-6">
                <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                    ← 返回仪表盘
                </Link>
            </div>
        </div>
    )
}

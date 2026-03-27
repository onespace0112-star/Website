'use client'

import React, { useState, useEffect } from 'react'
import {
    Database,
    RefreshCcw,
    Download,
    History,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    FileCheck,
    Clock,
    Package,
    HardDrive
} from 'lucide-react'
import { toast } from 'sonner'

interface Backup {
    name: string
    kind: 'full' | 'legacy'
    size: string
    time: string
}

export default function DatabaseManagement() {
    const [backups, setBackups] = useState<Backup[]>([])
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchBackups = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/database?action=list')
            const data = await res.json()
            if (data.backups) {
                setBackups(data.backups)
            }
        } catch (err) {
            toast.error('获取备份列表失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBackups()
    }, [])

    const handleBackup = async () => {
        setActionLoading('backup')
        try {
            const res = await fetch('/api/admin/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'backup' })
            })
            const text = await res.text()
            let data: Record<string, unknown> = {}
            try { data = JSON.parse(text) } catch { data = { error: text } }
            if (res.ok) {
                toast.success('备份成功')
                fetchBackups()
            } else {
                toast.error(String(data.error || `备份失败 (${res.status})`))
                console.error('Backup error:', res.status, data)
            }
        } catch (err) {
            toast.error(`请求失败: ${(err as Error).message}`)
            console.error('Backup fetch error:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRestore = async (backupName: string) => {
        if (!confirm(`确定要恢复备份 ${backupName} 吗？当前数据将被覆盖！`)) return

        setActionLoading(backupName)
        try {
            const res = await fetch('/api/admin/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore', backupName })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('数据库已恢复，建议刷新页面')
            } else {
                toast.error(data.error || '恢复失败')
            }
        } catch (err) {
            toast.error('请求失败')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (backupName: string) => {
        if (!confirm(`确定要删除备份 ${backupName} 吗？此操作不可恢复！`)) return

        setActionLoading(`delete-${backupName}`)
        try {
            const res = await fetch('/api/admin/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', backupName })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('备份已删除')
                fetchBackups()
            } else {
                toast.error(data.error || '删除失败')
            }
        } catch (err) {
            toast.error('请求失败')
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Database className="text-amber-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">数据库同步与管理</h1>
                        <p className="text-gray-500 text-sm mt-1">一键备份、恢复您的项目数据，保障数据安全。</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBackups}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        刷新
                    </button>
                    <button
                        onClick={handleBackup}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                        <Package size={18} />
                        创建完整备份
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics & Security section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <History size={18} className="text-amber-500" />
                            数据安全概览
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-500">已保存副本</span>
                                <span className="font-bold text-gray-900">{backups.length} 份</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-500">数据库类型</span>
                                <span className="font-bold text-gray-900">SQLite</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-500">自动防灾</span>
                                <span className="text-emerald-500 text-xs font-bold px-2 py-0.5 bg-emerald-50 rounded-full">已开启</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex gap-3">
                            <Package className="text-emerald-600 shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900">完整备份</h4>
                                <p className="text-xs text-emerald-800/70 mt-1 leading-relaxed">
                                    新备份包含数据库和所有上传文件（图片、文档等），确保数据完整性。旧备份（仅数据库）不含上传文件。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <div className="flex gap-3">
                            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">安全保护</h4>
                                <p className="text-xs text-amber-800/70 mt-1 leading-relaxed">
                                    系统在执行&quot;恢复&quot;操作前，会自动为您当前的数据创建临时备份，以确保即使操作失误也能随时找回。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backup List section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileCheck size={18} className="text-emerald-500" />
                                历史备份列表
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400">正在加载备份数据...</div>
                            ) : backups.length === 0 ? (
                                <div className="p-12 text-center space-y-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                        <History size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">暂无备份记录，请点击上方按钮创建第一个备份。</p>
                                </div>
                            ) : (
                                backups.map((backup) => {
                                    const isComplete = backup.kind === 'full'
                                    return (
                                        <div key={backup.name} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {isComplete ? <Package size={20} /> : <HardDrive size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">{backup.name}</p>
                                                            {isComplete && (
                                                                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                                                                    完整备份
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {new Date(backup.time).toLocaleString()}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{backup.size}</span>
                                                            {!isComplete && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-amber-500">仅数据库</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRestore(backup.name)}
                                                        disabled={!!actionLoading}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${isComplete
                                                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                            : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                                            }`}
                                                    >
                                                        {actionLoading === backup.name ? '正在恢复...' : '恢复此版本'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(backup.name)}
                                                        disabled={!!actionLoading}
                                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === `delete-${backup.name}` ? '删除中...' : '删除'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

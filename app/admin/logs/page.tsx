'use client'

import React, { useEffect, useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'

interface Log {
    id: number
    action: string
    content: string
    createdAt: string
}

interface GroupedLogs {
    [date: string]: Log[]
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    // Modal state for confirmation
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: 'selected' | 'day', payload?: any }>({ show: false, type: 'selected' })

    useEffect(() => {
        fetchLogs()
        // Poll every 5 seconds to keep logs updated in real time
        const interval = setInterval(() => {
            fetchLogs(true) // Pass true to silent loading
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const fetchLogs = async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const res = await fetch('/api/admin/logs', { cache: 'no-store' })
            const data = await res.json()
            if (Array.isArray(data)) setLogs(data)
        } catch (err) {
            console.error('Failed to fetch logs', err)
        } finally {
            if (!silent) setLoading(false)
        }
    }

    const deleteLogs = async (ids: number[]) => {
        try {
            const res = await fetch('/api/admin/logs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            })
            if (res.ok) {
                fetchLogs()
                setSelectedIds([])
                setConfirmModal({ show: false, type: 'selected' })
            }
        } catch (err) {
            console.error('Failed to delete logs', err)
        }
    }

    const deleteLogsByDate = async (date: string) => {
        try {
            // In backend we can handle date deltion, or just pass IDs. 
            // Passing IDs is safer if we already have them in frontend.
            // But let's use the date endpoint logic if we implemented it, or simple filter.
            // Wait, the backend implementation I wrote supports 'date'.

            const res = await fetch('/api/admin/logs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date })
            })
            if (res.ok) {
                fetchLogs()
                setConfirmModal({ show: false, type: 'day' })
            }
        } catch (err) {
            console.error('Failed to delete logs by date', err)
        }
    }

    // Grouping
    const groupedLogs: GroupedLogs = logs.reduce((acc, log) => {
        const date = new Date(log.createdAt).toISOString().split('T')[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(log)
        return acc
    }, {} as GroupedLogs)

    // Checkbox Logic
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(logs.map(log => log.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectLog = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        )
    }

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('en-GB', { hour12: false }) // HH:MM:SS
    }

    // Calculate how many days selected?
    // The alert says "Clear XXX days of logs?". 
    // If I select logs from 3 different days, XXX = 3?
    // Or if I select ALL logs which span 5 days, XXX = 5?
    const selectedDaysCount = new Set(
        logs.filter(l => selectedIds.includes(l.id))
            .map(l => new Date(l.createdAt).toISOString().split('T')[0])
    ).size

    const confirmClear = () => {
        if (confirmModal.type === 'selected') {
            deleteLogs(selectedIds)
        } else if (confirmModal.type === 'day') {
            deleteLogsByDate(confirmModal.payload)
        }
    }

    // Statistics
    const stats = React.useMemo(() => {
        const added = logs.filter(l => l.action.includes('增加') || l.action.toLowerCase().includes('add') || l.action.toLowerCase().includes('create') || l.action.includes('新增')).length
        const modified = logs.filter(l => l.action.includes('修改') || l.action.toLowerCase().includes('edit') || l.action.toLowerCase().includes('update') || l.action.includes('更新')).length
        const deleted = logs.filter(l => l.action.includes('删除') || l.action.toLowerCase().includes('delete') || l.action.toLowerCase().includes('remove')).length

        // Ensure total equals the sum of these three categories per user request
        const total = added + modified + deleted

        return { total, added, modified, deleted }
    }, [logs])

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 font-sans h-full">
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">总日志数</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-[#52c41a] text-xs font-medium uppercase tracking-wider mb-1">新增功能</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.added}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-[#faad14] text-xs font-medium uppercase tracking-wider mb-1">修改功能</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.modified}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-[#ff4d4f] text-xs font-medium uppercase tracking-wider mb-1">删除功能</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.deleted}</div>
                </div>
            </div>

            {/* Header / Actions */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="selectAll"
                        className="w-4 h-4 rounded border-gray-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
                        checked={logs.length > 0 && selectedIds.length === logs.length}
                        onChange={handleSelectAll}
                    />
                    <label htmlFor="selectAll" className="text-gray-600 font-medium cursor-pointer">全选</label>
                </div>

                <button
                    onClick={() => {
                        if (selectedIds.length === 0) return
                        setConfirmModal({ show: true, type: 'selected' })
                    }}
                    disabled={selectedIds.length === 0}
                    className={`bg-[#ff4d4f] text-white px-6 py-2 rounded text-sm font-medium transition-colors shadow-sm ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ff7875]'}`}
                >
                    清空日志
                </button>
            </div>

            {/* Logs List */}
            <div className="space-y-8">
                {Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a)).map(date => (
                    <div key={date} className="bg-[#f5f5f5] rounded-lg p-6 relative group/day">
                        {/* Day Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{date}</h3>
                            <button
                                onClick={() => setConfirmModal({ show: true, type: 'day', payload: date })}
                                className="text-[#0ea5e9] hover:text-red-500 transition-colors p-1"
                                title="清空当天日志"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* Logs Items */}
                        <div className="space-y-3">
                            {groupedLogs[date].map(log => (
                                <div key={log.id} className="flex items-start gap-3 text-gray-700 text-sm hover:bg-gray-200/50 p-2 rounded transition-colors cursor-pointer" onClick={() => handleSelectLog(log.id)}>
                                    {/* Usually user clicks checkbox, but clicking row is UX friendly too if we handle propagation */}
                                    {/* But wait, if I click row to select, it conflicts with text selection. Let's just create a layout */}
                                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                        {/* Hidden checkbox for logic consistency if needed, but ui design didn't explicitly show per-row checkbox other than 'Select All'. 
                                            Show per-row checkbox to allow partial selection? The screenshot implies selection ability.
                                         */}
                                    </div>
                                    <span className="font-mono text-gray-500 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                                    <span className="font-bold text-[#333] whitespace-nowrap">{log.action}</span>
                                    <span className="text-gray-600 break-all">{log.content}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {logs.length === 0 && (
                    <div className="text-center text-gray-400 py-20">暂无日志</div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <div className="flex justify-center mb-4 text-[#faad14]">
                                <AlertCircle size={48} />
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                {confirmModal.type === 'selected'
                                    ? `您确定要清空 ${selectedDaysCount} 天的所有日志？`
                                    : `您确定要清空 ${confirmModal.payload} 的所有日志？`
                                }
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    className="bg-[#d4d4d4] text-gray-700 px-6 py-1.5 rounded text-sm hover:bg-gray-400 hover:text-gray-800 transition-colors shadow-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmClear}
                                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors shadow-md font-medium"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

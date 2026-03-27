'use client'

import React, { useEffect, useState } from 'react'

interface TeamPosition {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}

export default function PositionsPage() {
    const [positions, setPositions] = useState<TeamPosition[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [filterName, setFilterName] = useState('')

    // Modals
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentPosition, setCurrentPosition] = useState<Partial<TeamPosition>>({})
    const [positionToDelete, setPositionToDelete] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/team/positions')
            const data = await res.json()
            if (Array.isArray(data)) setPositions(data)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = currentPosition.id ? 'PATCH' : 'POST'
        const url = currentPosition.id
            ? `/api/admin/team/positions/${currentPosition.id}`
            : '/api/admin/team/positions'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPosition)
            })
            if (res.ok) {
                setShowModal(false)
                fetchData()
            }
        } catch (error) {
            console.error('Save error:', error)
        }
    }

    const handleDeleteClick = (id: number) => {
        setPositionToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!positionToDelete) return
        try {
            const res = await fetch(`/api/admin/team/positions/${positionToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setPositionToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    // Filter Logic
    const uniqueTypes = Array.from(new Set(positions.map(p => p.name)))

    const filteredPositions = positions.filter(pos =>
        filterName ? pos.name === filterName : true
    )

    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="relative">
                    <select
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-[#0ea5e9] bg-white text-gray-700 appearance-none pr-8 cursor-pointer"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    >
                        <option value="">请选择职称类型</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                <button
                    className="bg-[#d4d4d4] hover:bg-gray-400 text-gray-800 px-6 py-1.5 rounded text-sm transition-colors"
                >
                    搜索
                </button>
                <button
                    className="bg-[#b48b3e] hover:bg-[#9a7633] text-white px-6 py-1.5 rounded text-sm transition-colors"
                    onClick={() => setFilterName('')}
                >
                    重置
                </button>

                <button
                    onClick={() => {
                        setCurrentPosition({})
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
                            <th className="px-4 py-3 border-r border-gray-300 w-24">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300">职称类型</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-48">更新时间</th>
                            <th className="px-4 py-3 w-40">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredPositions.map((pos, index) => (
                            <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{pos.name}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(pos.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(pos.updatedAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => { setCurrentPosition(pos); setShowModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium flex items-center gap-1 transition-colors"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(pos.id)}
                                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPositions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-gray-400">暂无数据</td>
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
                                {currentPosition.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-700 font-medium text-sm">职称类型:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入职称类型"
                                        value={currentPosition.name || ''}
                                        onChange={e => setCurrentPosition({ ...currentPosition, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 pt-6 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-8 py-2 rounded text-sm hover:bg-gray-400 transition-colors font-medium shadow-sm"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#0ea5e9] text-white px-8 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors font-medium shadow-md"
                                >
                                    保存
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
                                删除该职称类型，团队后台列表中的职称类型则不再展示此内容，您确定要继续删除吗？
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
        </div>
    )
}

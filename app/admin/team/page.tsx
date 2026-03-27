'use client'

import React, { useEffect, useState } from 'react'
import FileUpload from '@/components/FileUpload'
import HeaderManager from '../components/HeaderManager'

interface TeamMember {
    id: number
    name: string
    position: string
    image: string | null
    skills: string | null
    serviceMotion: string | null
    workingYears: string | null
    responsibilities: string | null
    order: number
    createdAt: string
    updatedAt: string
    cases: { case: { name: string } }[]
}

interface Position {
    id: number
    name: string
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)

    // Dynamic Positions
    const [availablePositions, setAvailablePositions] = useState<Position[]>([])
    const [loadingPositions, setLoadingPositions] = useState(false)

    // Filters
    const [filterName, setFilterName] = useState('')
    const [filterPosition, setFilterPosition] = useState('')

    // Modals
    const [showMemberModal, setShowMemberModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Form states
    const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({})
    const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    useEffect(() => {
        fetchData()
        fetchPositions()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/team')
            const data = await res.json()
            if (Array.isArray(data)) setMembers(data)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPositions = async () => {
        setLoadingPositions(true)
        try {
            const res = await fetch('/api/admin/team/positions')
            const data = await res.json()
            if (Array.isArray(data)) setAvailablePositions(data)
        } catch (err) {
            console.error('Failed to fetch positions:', err)
        } finally {
            setLoadingPositions(false)
        }
    }

    const handleReorder = async (id: number, direction: 'up' | 'down') => {
        try {
            const res = await fetch('/api/team/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, direction })
            })
            if (res.ok) fetchData()
        } catch (error) {
            console.error('Reorder error:', error)
        }
    }

    const handleDeleteClick = (id: number) => {
        setMemberToDelete(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!memberToDelete) return
        try {
            const res = await fetch(`/api/team/${memberToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setShowDeleteModal(false)
                setMemberToDelete(null)
                fetchData()
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const method = currentMember.id ? 'PATCH' : 'POST'
        const url = currentMember.id ? `/api/team/${currentMember.id}` : '/api/team'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentMember)
            })
            if (res.ok) {
                setShowMemberModal(false)
                fetchData()
                setToast({ show: true, type: 'success', message: '保存成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                const errorData = await res.json()
                setToast({ show: true, type: 'error', message: errorData.error || '保存失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (error) {
            console.error('Save error:', error)
            setToast({ show: true, type: 'error', message: '网络请求错误' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        } finally {
            setIsSaving(false)
        }
    }

    // Filter Logic
    const filteredMembers = members.filter(member => {
        const matchName = member.name.toLowerCase().includes(filterName.toLowerCase())
        const matchPosition = filterPosition
            ? member.position?.toLowerCase().trim() === filterPosition.toLowerCase().trim()
            : true
        return matchName && matchPosition
    })



    if (loading) return <div className="p-8 text-black">正在加载...</div>

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">


            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <input
                    type="text"
                    placeholder="请输入成员名称"
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                />
                <select
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                >
                    <option value="">请选择职称</option>
                    {availablePositions.map(pos => (
                        <option key={pos.id} value={pos.name}>{pos.name}</option>
                    ))}
                </select>

                <button
                    className="bg-[#d4d4d4] hover:bg-gray-400 text-gray-800 px-6 py-1.5 rounded text-sm transition-colors"
                    onClick={fetchData}
                >
                    搜索
                </button>
                <button
                    className="bg-[#b48b3e] hover:bg-[#9a7633] text-white px-6 py-1.5 rounded text-sm transition-colors"
                    onClick={() => { setFilterName(''); setFilterPosition(''); }}
                >
                    重置
                </button>

                <button
                    onClick={() => {
                        setCurrentMember({ order: members.length + 1 })
                        setShowMemberModal(true)
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
                            <th className="px-4 py-3 border-r border-gray-300 w-16">序号</th>
                            <th className="px-4 py-3 border-r border-gray-300">成员名称</th>
                            <th className="px-4 py-3 border-r border-gray-300">成员照片</th>
                            <th className="px-4 py-3 border-r border-gray-300">职称</th>
                            <th className="px-4 py-3 border-r border-gray-300">工作年限</th>
                            <th className="px-4 py-3 border-r border-gray-300">职责</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-20">权重</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">创建时间</th>
                            <th className="px-4 py-3 border-r border-gray-300 w-32">更新时间</th>
                            <th className="px-4 py-3 w-40">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map((member, index) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-800 font-medium">{member.name}</td>
                                <td className="px-4 py-3 border-r border-gray-200">
                                    {member.image ? (
                                        <img src={member.image} className="w-10 h-10 rounded-sm object-cover mx-auto bg-gray-100 border border-gray-200" alt="" />
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{member.position}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{member.workingYears || '-'}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600 max-w-[200px] truncate" title={member.responsibilities || ''}>{member.responsibilities || '-'}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-600">{member.order}</td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-200 text-gray-500 text-xs">
                                    {new Date(member.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => { setCurrentMember(member); setShowMemberModal(true); }}
                                            className="text-[#0ea5e9] hover:text-[#0284c7] font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(member.id)}
                                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            删除
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan={9} className="py-8 text-gray-400">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Add/Edit Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-[#f0f2f5] w-full max-w-lg shadow-xl overflow-hidden rounded-sm animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-3 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg tracking-wide pl-2">
                                {currentMember.id ? '编辑' : '添加'}
                            </h3>
                            <button onClick={() => setShowMemberModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSaveMember} className="p-8 space-y-5">
                            {/* Position */}
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">成员职称:</label>
                                <div className="flex-1">
                                    <select
                                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700"
                                        value={currentMember.position || ''}
                                        onChange={e => setCurrentMember({ ...currentMember, position: e.target.value })}
                                        disabled={loadingPositions}
                                    >
                                        <option value="">请选择职称</option>
                                        {availablePositions.map(pos => (
                                            <option key={pos.id} value={pos.name}>{pos.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">成员名称:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入标题"
                                        value={currentMember.name || ''}
                                        onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Photo (Upload) */}
                            <div className="flex items-start group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm pt-2">成员照片:</label>
                                <div className="flex-1">
                                    <FileUpload
                                        onUploadSuccess={url => setCurrentMember({ ...currentMember, image: url })}
                                    >
                                        <div className="bg-white border border-gray-300 w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-colors relative group overflow-hidden">
                                            {currentMember.image ? (
                                                <>
                                                    <img src={currentMember.image} className="w-full h-full object-cover" alt="Preview" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-bold">更换</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-3xl text-gray-400 font-light">+</span>
                                                    <span className="text-xs text-gray-500 mt-1">上传</span>
                                                </>
                                            )}
                                        </div>
                                    </FileUpload>
                                </div>
                            </div>



                            {/* Working Years */}
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">工作年限:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入工作年限"
                                        value={currentMember.workingYears || ''}
                                        onChange={e => setCurrentMember({ ...currentMember, workingYears: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Responsibilities */}
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">职责:</label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入职责"
                                        value={currentMember.responsibilities || ''}
                                        onChange={e => setCurrentMember({ ...currentMember, responsibilities: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="flex items-center group">
                                <label className="w-24 text-right pr-4 text-gray-600 font-bold text-sm">权重:</label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors text-gray-700 placeholder-gray-400"
                                        placeholder="请输入权重"
                                        value={currentMember.order || 0}
                                        onChange={e => setCurrentMember({ ...currentMember, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center gap-6 pt-4 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMemberModal(false)}
                                    className="bg-[#d4d4d4] text-gray-700 px-8 py-2 rounded text-sm hover:bg-gray-400 transition-colors font-medium shadow-sm"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`bg-[#0ea5e9] text-white px-8 py-2 rounded text-sm hover:bg-[#0284c7] transition-colors font-medium shadow-md ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                        <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                            <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                                <h3 className="text-white font-bold text-md pl-2">提示</h3>
                                <button onClick={() => setShowDeleteModal(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                            </div>
                            <div className="p-8 text-center bg-[#f9fafb]">
                                <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                    删除该成员，页面将不再展示此内容，您确定要继续删除吗？
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
                )
            }

            {/* Success/Error Toast */}
            {
                toast.show && (
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
                )
            }
        </div >
    )
}

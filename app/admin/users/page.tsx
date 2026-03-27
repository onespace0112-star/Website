'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
    id: number
    name: string
    email: string | null
    phone: string | null
    createdAt: string
    _count: { chats: number }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const formatPhone = (phone: string) => {
        const trimmed = phone.trim()
        if (trimmed.startsWith('+86')) {
            return { code: '+86', number: trimmed.slice(3).trim() }
        }
        if (trimmed.startsWith('86')) {
            return { code: '+86', number: trimmed.slice(2).trim() }
        }
        if (trimmed.startsWith('+')) {
            const match = trimmed.match(/^(\+\d{1,3})\s*(.+)$/)
            if (match) return { code: match[1], number: match[2].trim() }
        }
        return { code: '', number: trimmed }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data.users || [])
            }
        } catch (e) {
            console.error('Failed to fetch users', e)
        } finally {
            setLoading(false)
        }
    }

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null })
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

    const openDeleteModal = (id: number) => {
        setDeleteModal({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (!deleteModal.id) return

        try {
            const res = await fetch(`/api/admin/users?id=${deleteModal.id}`, { method: 'DELETE' })
            if (res.ok) {
                setUsers(users.filter(u => u.id !== deleteModal.id))
                setDeleteModal({ isOpen: false, id: null })
                setToast({ show: true, type: 'success', message: '删除成功' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000)
            } else {
                setToast({ show: true, type: 'error', message: '删除失败' })
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
            }
        } catch (e) {
            console.error('Delete failed', e)
            setToast({ show: true, type: 'error', message: '删除失败' })
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
        }
    }

    return (
        <div className="space-y-6 pb-20 p-6 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow-sm border border-gray-100">共 {users.length} 个用户</span>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-semibold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">名字</th>
                            <th className="px-6 py-4">邮箱/手机</th>
                            <th className="px-6 py-4">对话数</th>
                            <th className="px-6 py-4">注册时间</th>
                            <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">加载中...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">暂无注册用户</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.email ? (
                                            user.email
                                        ) : user.phone ? (
                                            (() => {
                                                const formatted = formatPhone(user.phone)
                                                if (!formatted.code) return formatted.number
                                                return (
                                                    <span>
                                                        <span className="mr-[5px]">{formatted.code}</span>
                                                        <span>{formatted.number}</span>
                                                    </span>
                                                )
                                            })()
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {user._count.chats}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {new Date(user.createdAt).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => openDeleteModal(user.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors py-1 px-3 hover:bg-red-50 rounded"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center font-sans">
                    <div className="bg-white w-full max-w-[400px] rounded shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="bg-[#0ea5e9] px-4 py-2 flex justify-between items-center">
                            <h3 className="text-white font-bold text-md pl-2">提示</h3>
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-8 text-center bg-[#f9fafb]">
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 px-4 font-medium">
                                确定删除该用户？所有相关数据也会被删除，且无法恢复。
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null })}
                                    className="bg-[#d4d4d4] text-gray-700 px-6 py-1.5 rounded text-sm hover:bg-gray-400 hover:text-gray-800 transition-colors shadow-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-[#0ea5e9] text-white px-6 py-1.5 rounded text-sm hover:bg-[#0284c7] transition-colors shadow-md font-medium"
                                >
                                    确定删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Toast */}
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
        </div>
    )
}

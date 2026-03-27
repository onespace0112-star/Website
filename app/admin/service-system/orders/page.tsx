'use client'

import React, { useState, useEffect } from 'react'

type ServiceOrder = {
    id: number
    serviceCategory: string
    serviceType: string
    country: string
    name: string
    contact: string
    houseArea: string | null
    fee: string
    serviceItems: string
    travelDate: string | null
    createdAt: string
}

export default function ServiceOrdersPage() {
    const [tab, setTab] = useState<'design' | 'procurement'>('design')
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ show: boolean; type: string; message: string }>({ show: false, type: '', message: '' })

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/service-orders?category=${tab}`)
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => { fetchOrders() }, [tab])

    const showToast = (type: string, message: string) => {
        setToast({ show: true, type, message })
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该订单？')) return
        try {
            const res = await fetch('/api/admin/service-orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                showToast('success', '删除成功')
                fetchOrders()
            } else {
                showToast('error', '删除失败')
            }
        } catch {
            showToast('error', '删除失败')
        }
    }

    const exportExcel = () => {
        const headers = tab === 'design'
            ? ['序号', '国家', '姓名', '手机号/邮箱', '服务类型', '房屋面积', '项目启动费用', '提交时间']
            : ['序号', '国家', '姓名', '手机号/邮箱', '服务类型', '服务费用', '行程时间', '提交时间']

        const rows = orders.map((o, i) => {
            if (tab === 'design') {
                return [i + 1, o.country, o.name, o.contact, o.serviceType, o.houseArea || '', o.fee, new Date(o.createdAt).toLocaleString()]
            } else {
                return [i + 1, o.country, o.name, o.contact, o.serviceType, o.fee, o.travelDate || '', new Date(o.createdAt).toLocaleString()]
            }
        })

        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `service_orders_${tab}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const formatDate = (d: string) => {
        const date = new Date(d)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    return (
        <div className="p-6">
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg text-white text-sm shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6 text-gray-800">订单管理</h1>

            {/* Tab + Export */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex">
                    <button
                        onClick={() => setTab('design')}
                        className={`px-6 py-2 text-sm font-bold rounded-l-lg transition-all cursor-pointer ${tab === 'design' ? 'bg-[#00aaff] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        设计服务
                    </button>
                    <button
                        onClick={() => setTab('procurement')}
                        className={`px-6 py-2 text-sm font-bold rounded-r-lg transition-all cursor-pointer ${tab === 'procurement' ? 'bg-[#00aaff] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        采购服务
                    </button>
                </div>
                <button
                    onClick={exportExcel}
                    className="px-5 py-2 bg-[#00aaff] text-white text-sm font-bold rounded-lg hover:bg-[#0099ee] transition-all cursor-pointer"
                >
                    导出Excel
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">序号</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">国家</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">姓名</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">手机号/邮箱</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">服务类型</th>
                            {tab === 'design' ? (
                                <>
                                    <th className="px-4 py-3 text-left text-gray-600 font-medium">房屋面积</th>
                                    <th className="px-4 py-3 text-left text-gray-600 font-medium">项目启动费用</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-left text-gray-600 font-medium">服务费用</th>
                                    <th className="px-4 py-3 text-left text-gray-600 font-medium">行程时间</th>
                                </>
                            )}
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">提交时间</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
                        ) : orders.map((order, idx) => (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                <td className="px-4 py-3 text-gray-800">{order.country || '-'}</td>
                                <td className="px-4 py-3 text-gray-800">{order.name || '-'}</td>
                                <td className="px-4 py-3 text-gray-800">{order.contact || '-'}</td>
                                <td className="px-4 py-3 text-gray-800">{order.serviceType}</td>
                                {tab === 'design' ? (
                                    <>
                                        <td className="px-4 py-3 text-gray-800">{order.houseArea || '-'}</td>
                                        <td className="px-4 py-3 text-gray-800">{order.fee}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-gray-800">{order.fee}</td>
                                        <td className="px-4 py-3 text-gray-800">{order.travelDate || '-'}</td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 font-medium cursor-pointer">
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

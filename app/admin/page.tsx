'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import * as XLSX from 'xlsx'
import {
    Users,
    ClipboardList,
    UserCheck,
    HelpCircle,
    ChevronDown,
    CheckSquare,
    Square,
    RefreshCcw
} from 'lucide-react'

interface DashboardStats {
    cards: {
        cumulativeUsers: number
        totalQuotes: number
        totalIntents: number
        totalDeals: number
    }
    stats: {
        quoteStats: CountryStat[]
        intentStats: CountryStat[]
        dealStats: CountryStat[]
        sourceStats: SourceStat[]
        sourceTotals: {
            daily: number
            monthly: number
            total: number
        }
    }
}

interface CountryStat {
    country: string
    cumulative: number
    monthly: number
}

interface SourceStat {
    source: string
    country?: string
    daily: number
    monthly: number
    total: number
}

const pieDataAmount = [
    { name: '新用户', value: 40, color: '#3b82f6' },
    { name: '老用户', value: 60, color: '#f97316' },
]

const pieDataCount = [
    { name: '新用户', value: 30, color: '#3b82f6' },
    { name: '老用户', value: 70, color: '#f97316' },
]

type SortOption = 'default' | 'cumulative-desc' | 'cumulative-asc' | 'monthly-desc' | 'monthly-asc';

const sortOptions: { value: SortOption, label: string }[] = [
    { value: 'default', label: '请选择' },
    { value: 'cumulative-desc', label: '从高到低 (累计报价数)' },
    { value: 'cumulative-asc', label: '从低到高 (累计报价数)' },
    { value: 'monthly-desc', label: '从高到低 (月报价数)' },
    { value: 'monthly-asc', label: '从低到高 (月报价数)' },
];

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardStats | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeRegionTab, setActiveRegionTab] = useState<'quote' | 'intent' | 'deal'>('quote')
    const [timeRange, setTimeRange] = useState('近30天')
    const [sortOption, setSortOption] = useState<SortOption>('default')
    const [showTooltip, setShowTooltip] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [visitData, setVisitData] = useState<{ total: number, cumulativeTotal: number, chartData: any[] } | null>(null)
    const [visitRange, setVisitRange] = useState('24h')
    const [loadingVisits, setLoadingVisits] = useState(true)

    const [visitStats, setVisitStats] = useState<{ total: number, rows: any[] } | null>(null)
    const [visitStatsRange, setVisitStatsRange] = useState('7d')
    const [visitStatsPage, setVisitStatsPage] = useState(1)
    const [loadingVisitStats, setLoadingVisitStats] = useState(true)
    const visitStatsPageSize = 20

    const timeRanges = ['近7天', '近30天', '本月', '本年']
    const visitRanges = [
        { label: '1h', value: '1h' },
        { label: '6h', value: '6h' },
        { label: '12h', value: '12h' },
        { label: 'Today', value: '24h' },
        { label: '7d', value: '7d' },
        { label: '30d', value: '30d' },
    ]

    const fetchVisitStats = async (range: string, page: number) => {
        setLoadingVisitStats(true)
        try {
            const res = await fetch(`/api/admin/visit-stats?range=${range}&page=${page}&pageSize=${visitStatsPageSize}`, { cache: 'no-store' })
            if (res.ok) setVisitStats(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingVisitStats(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
        fetchVisitData(visitRange)
        fetchVisitStats(visitStatsRange, visitStatsPage)

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
            if (res.ok) {
                const json = await res.json()
                setData(json)
                setError(null)
            } else {
                setError('概览数据加载失败，请刷新重试')
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data', error)
            setError('概览数据加载失败，请检查服务状态')
        } finally {
            setLoading(false)
        }
    }

    const fetchVisitData = async (range: string) => {
        setLoadingVisits(true)
        try {
            const res = await fetch(`/api/admin/visits?range=${range}`, { cache: 'no-store' })
            if (res.ok) {
                const json = await res.json()
                setVisitData(json)
            }
        } catch (error) {
            console.error('Failed to fetch visit data', error)
        } finally {
            setLoadingVisits(false)
        }
    }

    const handleVisitRangeChange = (range: string) => {
        setVisitRange(range)
        fetchVisitData(range)
    }

    const handleVisitStatsRangeChange = (range: string) => {
        setVisitStatsRange(range)
        setVisitStatsPage(1)
        fetchVisitStats(range, 1)
    }

    const handleVisitStatsPageChange = (page: number) => {
        setVisitStatsPage(page)
        fetchVisitStats(visitStatsRange, page)
    }

    const handleExportSourceStats = () => {
        if (!data?.stats?.sourceStats) return;

        const exportData = data.stats.sourceStats.map(stat => ({
            '来源': stat.source || 'Direct',
            '国家': stat.country || 'Unknown',
            '今日': stat.daily,
            '本月': stat.monthly,
            '累计': stat.total
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customer Source Stats");
        XLSX.writeFile(wb, `customer_source_stats_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getSortedData = () => {
        if (!data) return [];
        const list =
            activeRegionTab === 'quote'
                ? [...(data.stats.quoteStats || [])]
                : activeRegionTab === 'intent'
                    ? [...(data.stats.intentStats || [])]
                    : [...(data.stats.dealStats || [])];

        switch (sortOption) {
            case 'cumulative-desc':
                return list.sort((a, b) => b.cumulative - a.cumulative);
            case 'cumulative-asc':
                return list.sort((a, b) => a.cumulative - b.cumulative);
            case 'monthly-desc':
                return list.sort((a, b) => b.monthly - a.monthly);
            case 'monthly-asc':
                return list.sort((a, b) => a.monthly - b.monthly);
            default:
                return list;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-slate-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-[#E2B05E]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#E2B05E] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Intelligence...</span>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="bg-white border border-slate-200 rounded-2xl px-8 py-6 text-center shadow-sm">
                    <p className="text-slate-700 font-semibold mb-2">{error || '概览暂无数据'}</p>
                    <button
                        onClick={() => {
                            setLoading(true)
                            fetchDashboardData()
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-[#0F172A] text-white hover:bg-slate-800 transition-colors"
                    >
                        重新加载
                    </button>
                </div>
            </div>
        )
    }

    const currentTableData = getSortedData();

    return (
        <div className="space-y-10 pb-20">
            {/* Header section with refined stats cards */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        数据中心
                        <span className="text-sm font-medium text-slate-400 border-l border-slate-200 pl-3">DASHBOARD OVERVIEW</span>
                    </h1>
                    <p className="text-slate-500 mt-2">欢迎回来，这是您今天的业务概况数据。</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    {timeRanges.map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${timeRange === range
                                ? 'bg-[#0F172A] text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: '累计用户', value: data.cards.cumulativeUsers, icon: <Users size={24} />, color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20' },
                    { label: '报价人数', value: data.cards.totalQuotes, icon: <ClipboardList size={24} />, color: 'from-amber-500 to-[#B8860B]', shadow: 'shadow-amber-500/20' },
                    { label: '业务意向', value: data.cards.totalIntents, icon: <CheckSquare size={24} />, color: 'from-emerald-500 to-teal-700', shadow: 'shadow-emerald-500/20' },
                    { label: '成功案例', value: data.cards.totalDeals, icon: <UserCheck size={24} />, color: 'from-rose-500 to-red-700', shadow: 'shadow-rose-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-[100px] group-hover:opacity-[0.05] transition-opacity`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                            {stat.value.toLocaleString()}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Customer Source Module */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">客户来源统计</h3>
                            <button
                                onClick={handleExportSourceStats}
                                className="px-3 py-1 text-xs font-bold text-rose-500 border border-rose-500 rounded hover:bg-rose-50 transition-colors"
                            >
                                导出excel数据
                            </button>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Daily / Monthly / Total by Source</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span>今日总数: <span className="text-slate-900">{data.stats.sourceTotals?.daily || 0}</span></span>
                        <span>本月总数: <span className="text-slate-900">{data.stats.sourceTotals?.monthly || 0}</span></span>
                        <span>累计总数: <span className="text-slate-900">{data.stats.sourceTotals?.total || 0}</span></span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                                <th className="px-10 py-4 text-left text-[10px] font-black uppercase tracking-widest">来源</th>
                                <th className="px-10 py-4 text-left text-[10px] font-black uppercase tracking-widest">国家</th>
                                <th className="px-10 py-4 text-center text-[10px] font-black uppercase tracking-widest">今日</th>
                                <th className="px-10 py-4 text-center text-[10px] font-black uppercase tracking-widest">本月</th>
                                <th className="px-10 py-4 text-center text-[10px] font-black uppercase tracking-widest">累计</th>
                                <th className="px-10 py-4 text-center text-[10px] font-black uppercase tracking-widest">报价人数</th>
                                <th className="px-10 py-4 text-center text-[10px] font-black uppercase tracking-widest">意向人数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(data.stats.sourceStats || []).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-10 py-8 text-center text-slate-400">暂无来源数据</td>
                                </tr>
                            ) : (
                                (data.stats.sourceStats || []).map((row, idx) => (
                                    <tr key={`${row.source}-${idx}`} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-10 py-5 font-bold text-slate-700">{row.source || 'Direct'}</td>
                                        <td className="px-10 py-5 text-slate-600">{row.country || 'Unknown'}</td>
                                        <td className="px-10 py-5 text-center font-black text-slate-700">{row.daily}</td>
                                        <td className="px-10 py-5 text-center font-black text-slate-700">{row.monthly}</td>
                                        <td className="px-10 py-5 text-center font-black text-slate-900">{row.total}</td>
                                        <td className="px-10 py-5 text-center font-black text-blue-600">{(row as any).quoteCount ?? 0}</td>
                                        <td className="px-10 py-5 text-center font-black text-emerald-600">{(row as any).inquiryCount ?? 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                实时访问流量
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </h3>
                            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">网站流量监控</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                            {visitRanges.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleVisitRangeChange(r.value)}
                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${visitRange === r.value
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        {loadingVisits ? (
                            <div className="h-full flex items-center justify-center">
                                <RefreshCcw className="animate-spin text-slate-200" size={32} />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={visitData?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E2B05E" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#E2B05E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={15}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', color: '#fff' }}
                                        itemStyle={{ color: '#E2B05E', fontWeight: 800 }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#E2B05E"
                                        strokeWidth={4}
                                        fill="url(#colorVisits)"
                                        activeDot={{ r: 6, fill: '#0F172A', stroke: '#E2B05E', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Engagement / Conversion Pie */}
                <div className="bg-[#0F172A] p-8 rounded-[32px] shadow-xl shadow-slate-900/20 text-white flex flex-col items-center">
                    <h3 className="text-lg font-black mr-auto mb-2 tracking-tight">客户参与度</h3>
                    <p className="text-xs text-slate-500 mr-auto mb-10 uppercase tracking-widest font-bold">新客 vs 老客</p>

                    <div className="relative w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieDataCount}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieDataCount.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#E2B05E' : '#1E293B'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', backgroundColor: '#fff', color: '#000', border: 'none' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-white">76%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">增长率</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 w-full">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#E2B05E]"></div>
                                <span className="text-xs font-bold text-slate-300">新客户</span>
                            </div>
                            <span className="text-sm font-black">+240</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                <span className="text-xs font-bold text-slate-300">老客户</span>
                            </div>
                            <span className="text-sm font-black">+1,200</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visit Statistics Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">用户访问数据统计</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            共 {visitStats?.total ?? 0} 条记录
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl">
                        {[{ label: '近1天', value: '1d' }, { label: '近7天', value: '7d' }, { label: '近30天', value: '30d' }].map(r => (
                            <button
                                key={r.value}
                                onClick={() => handleVisitStatsRangeChange(r.value)}
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${visitStatsRange === r.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loadingVisitStats ? (
                        <div className="flex justify-center items-center py-16">
                            <RefreshCcw className="animate-spin text-slate-200" size={28} />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                                    {['访问来源', '来源网站', '搜索关键词', '浏览器类型', '操作系统', '访问设备类型', '访问时间', '访问页面路径', '访问IP地址', '访问次数'].map(h => (
                                        <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(visitStats?.rows || []).length === 0 ? (
                                    <tr><td colSpan={10} className="px-10 py-10 text-center text-slate-400">暂无访问数据</td></tr>
                                ) : (
                                    (visitStats?.rows || []).map((row: any) => (
                                        <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                    row.source === 'Direct' ? 'bg-slate-100 text-slate-600' :
                                                    row.source === 'Search' ? 'bg-blue-50 text-blue-600' :
                                                    row.source === 'Social' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>{row.source}</span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-[120px] truncate">{row.referrerHost}</td>
                                            <td className="px-5 py-4 text-slate-500">{row.searchKeyword}</td>
                                            <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{row.browser}</td>
                                            <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{row.os}</td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                    row.device === 'Mobile' ? 'bg-rose-50 text-rose-600' :
                                                    row.device === 'Tablet' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                                }`}>{row.device}</span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                                                {new Date(row.visitTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 max-w-[150px] truncate text-xs font-mono">{row.path}</td>
                                            <td className="px-5 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">{row.ip}</td>
                                            <td className="px-5 py-4 text-center font-black text-slate-700">{row.visitCount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Pagination */}
                {visitStats && visitStats.total > visitStatsPageSize && (
                    <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">
                            第 {visitStatsPage} 页 / 共 {Math.ceil(visitStats.total / visitStatsPageSize)} 页
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={visitStatsPage <= 1}
                                onClick={() => handleVisitStatsPageChange(visitStatsPage - 1)}
                                className="px-4 py-2 text-xs font-black rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >上一页</button>
                            <button
                                disabled={visitStatsPage >= Math.ceil(visitStats.total / visitStatsPageSize)}
                                onClick={() => handleVisitStatsPageChange(visitStatsPage + 1)}
                                className="px-4 py-2 text-xs font-black rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >下一页</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Geographic Distribution Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">全球业务分布</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">全球区域分析</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                onClick={() => setActiveRegionTab('quote')}
                                className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeRegionTab === 'quote' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                报价统计
                            </button>
                            <button
                                onClick={() => setActiveRegionTab('intent')}
                                className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeRegionTab === 'intent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                意向统计
                            </button>
                            <button
                                onClick={() => setActiveRegionTab('deal')}
                                className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${activeRegionTab === 'deal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                成交统计
                            </button>
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-56 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all group"
                            >
                                <span>{sortOption === 'default' ? '默认排序' : '按数值排序'}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    {sortOptions.map((opt) => (
                                        <div
                                            key={opt.value}
                                            onClick={() => { setSortOption(opt.value); setIsDropdownOpen(false) }}
                                            className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                                <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">国家/地区</th>
                                <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest">累计数量</th>
                                <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest">本月趋势</th>
                                <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest">状态</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentTableData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-10 text-center text-slate-400">
                                        暂无数据
                                    </td>
                                </tr>
                            ) : (
                                currentTableData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-[#E2B05E] group-hover:text-white transition-colors uppercase">
                                                    {row.country.substring(0, 2)}
                                                </div>
                                                <span className="font-black text-slate-700">{row.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-lg font-black text-slate-900">{row.cumulative}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-slate-600">{row.monthly}</span>
                                                <div className="w-20 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-[#E2B05E]" style={{ width: `${Math.min((row.monthly / row.cumulative) * 300, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                                                正常
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

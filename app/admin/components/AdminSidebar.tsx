'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Home,
    Briefcase,
    Share2,
    FolderOpen,
    HelpCircle,
    Users,
    FileText,
    DollarSign,
    Book,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    LogOut,
    Tag,
    ClipboardList,
    Video,
    ShoppingCart,
    Package,
    KeyRound
} from 'lucide-react'

type MenuItem = {
    title: string
    icon?: React.ReactNode
    href?: string
    children?: MenuItem[]
}

const menuItems: MenuItem[] = [
    {
        title: '后台管理',
        icon: <LayoutDashboard size={18} />,
        children: [
            { title: '概览', href: '/admin' },
            { title: '用户管理', href: '/admin/users' },
            { title: 'Logo管理', href: '/admin/logo' },
            { title: '登录管理', href: '/admin/login-settings' },
            { title: '数据库管理', href: '/admin/database' },
        ]
    },
    {
        title: '首页管理',
        icon: <Home size={18} />,
        children: [

            { title: '轮播图管理', href: '/admin/home/carousel' },
            { title: 'onespace管理', href: '/admin/home/onespace' },
            { title: '全球采集管理', href: '/admin/home/global-collect' },
            { title: '画廊管理', href: '/admin/home/gallery' },
            { title: '优势管理', href: '/admin/home/advantages' },
            { title: '售后管理', href: '/admin/home/aftersales' },
            { title: '成交案例管理', href: '/admin/home/cases' },
            { title: '公司简介管理', href: '/admin/home/company-intro' },
        ]
    },
    {
        title: '关于我们管理',
        icon: <Users size={18} />,
        href: '/admin/about'
    },
    {
        title: '服务管理',
        icon: <Briefcase size={18} />,
        children: [
            { title: '头部管理', href: '/admin/services/headers' },
            { title: '服务列表管理', href: '/admin/services/list' },
            { title: '服务类型管理', href: '/admin/services/types' },
            { title: '质量保证管理', href: '/admin/services/qa' },
        ]
    },
    {
        title: '产品管理',
        icon: <Package size={18} />,
        children: [
            { title: '头部管理', href: '/admin/products/headers' },
            { title: '产品分类管理', href: '/admin/products/styles' },
        ]
    },
    {
        title: '流程管理',
        icon: <Share2 size={18} />,
        children: [
            { title: '头部管理', href: '/admin/processes/headers' },
            { title: '流程列表', href: '/admin/processes' },
        ]
    },
    {
        title: '视频管理',
        icon: <Video size={18} />,
        children: [
            { title: '头部管理', href: '/admin/video/headers' },
            { title: '视频列表管理', href: '/admin/video/list' },
            { title: '视频类型管理', href: '/admin/video/types' },
        ]
    },
    {
        title: '项目案例管理',
        icon: <FolderOpen size={18} />,
        children: [
            { title: '头部管理', href: '/admin/projects/headers' },
            { title: '项目案例列表', href: '/admin/projects' },
            { title: '项目案例类型管理', href: '/admin/projects/types' },
        ]
    },
    {
        title: 'FAQ管理',
        icon: <HelpCircle size={18} />,
        children: [
            { title: '头部管理', href: '/admin/faq/headers' },
            { title: '常见问题列表', href: '/admin/faq' },
            { title: '问题类型管理', href: '/admin/faq/types' },
            { title: '问题管理', href: '/admin/faq/questions' },
        ]
    },
    {
        title: '团队管理',
        icon: <Users size={18} />,
        children: [
            { title: '头部管理', href: '/admin/team/headers' },
            { title: '团队列表', href: '/admin/team' },
            { title: '职位管理', href: '/admin/team/positions' },
        ]
    },
    {
        title: '联系我们管理',
        icon: <FileText size={18} />,
        children: [
            { title: '头部管理', href: '/admin/inquiries/headers' },
            { title: '意向列表', href: '/admin/inquiries' },
            { title: '公司信息管理', href: '/admin/inquiries/company' },
        ]
    },
    {
        title: '聊天留资',
        icon: <FileText size={18} />,
        href: '/admin/leads'
    },
    {
        title: '报价管理',
        icon: <DollarSign size={18} />,
        href: '/admin/quotes'
    },
    {
        title: '服务体系管理',
        icon: <ShoppingCart size={18} />,
        children: [
            { title: '订单管理', href: '/admin/service-system/orders' },
            { title: '服务管理', href: '/admin/service-system/packages' },
        ]
    },
    {
        title: '反馈管理',
        icon: <Tag size={18} />,
        children: [
            { title: '反馈列表', href: '/admin/feedback' },
            { title: '反馈问题类型', href: '/admin/feedback/types' },
        ]
    },
    {
        title: '日志管理',
        icon: <ClipboardList size={18} />,
        href: '/admin/logs'
    },
    {
        title: '知识库管理',
        icon: <Book size={18} />,
        href: '/admin/knowledge'
    },
    {
        title: '知识补全审核',
        icon: <Book size={18} />,
        href: '/admin/knowledge-suggestions'
    },
    {
        title: 'AI配置',
        icon: <Settings size={18} />,
        href: '/admin/ai-config'
    },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [openGroups, setOpenGroups] = useState<string[]>(['后台管理', '首页管理'])

    const toggleGroup = (title: string) => {
        setOpenGroups(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    const isActive = (href?: string) => {
        if (!href) return false
        if (href === '/admin' && pathname === '/admin') return true
        if (href !== '/admin' && pathname === href) return true
        if (href !== '/admin' && pathname?.startsWith(href + '/')) return true
        return false
    }

    const isChildActive = (href?: string, siblings: string[] = []) => {
        if (!href) return false
        if (pathname === href) return true
        if (pathname?.startsWith(href + '/')) {
            const siblingMatch = siblings.some((s) => s !== href && pathname === s)
            if (siblingMatch) return false
            // Avoid marking parent list active when a known sibling page is active
            const siblingPrefixMatch = siblings.some((s) => s !== href && pathname?.startsWith(s + '/'))
            if (siblingPrefixMatch) return false
            return true
        }
        return false
    }

    return (
        <nav className="fixed left-0 top-0 h-full w-64 bg-[#0F172A] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-50 border-r border-white/5">
            <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E2B05E] to-[#B8860B] rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20 mb-2">
                    <span className="text-2xl font-black text-white">1</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-[#F3D19E] via-[#E2B05E] to-[#B8860B] bg-clip-text text-transparent tracking-[0.2em]">ONE SPACE</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-medium">Management System</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {menuItems.map((item, idx) => {
                    const isOpen = openGroups.includes(item.title)
                    const hasChildren = item.children && item.children.length > 0
                    const active = isActive(item.href)

                    if (hasChildren) {
                        return (
                            <div key={idx} className="mb-4">
                                <button
                                    onClick={() => toggleGroup(item.title)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 ${isOpen ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`${isOpen ? 'text-[#E2B05E]' : 'text-slate-500'}`}>
                                            {item.icon}
                                        </span>
                                        <span>{item.title}</span>
                                    </div>
                                    {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                </button>

                                {isOpen && (
                                    <div className="mt-2 ml-4 pl-4 border-l border-white/10 space-y-1">
                                        {item.children!.map((child, childIdx) => {
                                            const siblingHrefs = (item.children || [])
                                                .map((c) => c.href)
                                                .filter((h): h is string => Boolean(h))
                                            const childActive = isChildActive(child.href, siblingHrefs)
                                            return (
                                                <Link
                                                    key={childIdx}
                                                    href={child.href || '#'}
                                                    className={`block px-4 py-2.5 rounded-lg text-[13px] transition-all duration-300 relative group ${childActive
                                                        ? 'text-[#E2B05E] font-bold bg-[#E2B05E]/10'
                                                        : 'text-slate-400 hover:text-white hover:translate-x-1'
                                                        }`}
                                                >
                                                    {childActive && (
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#E2B05E] rounded-full -ml-[23px] shadow-[0_0_8px_#E2B05E]" />
                                                    )}
                                                    {child.title}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={idx}
                            href={item.href || '#'}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 mb-2 ${active
                                ? 'bg-[#E2B05E] text-[#1E1B4B] shadow-[0_8px_20px_rgba(226,176,94,0.3)] transform scale-[1.02]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`${active ? 'text-[#1E1B4B]' : 'text-slate-500'}`}>
                                {item.icon}
                            </span>
                            <span>{item.title}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="p-6 border-t border-white/5">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-lg shadow-red-500/5"
                >
                    <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>退出系统</span>
                </Link>
            </div>
        </nav>
    )
}

'use client'

import React, { useState } from 'react'
import AboutHeaderManager from './components/AboutHeaderManager'
import AboutIntroManager from './components/AboutIntroManager'
import AboutMilestoneManager from './components/AboutMilestoneManager'
import AboutVisionManager from './components/AboutVisionManager'

export default function AboutAdminPage() {
    const [activeTab, setActiveTab] = useState<'header' | 'intro' | 'milestones' | 'vision'>('header')

    const tabs = [
        { id: 'header', label: '头部管理' },
        { id: 'intro', label: '简介管理' },
        { id: 'milestones', label: '发展里程管理' },
        { id: 'vision', label: '企业愿景管理' },
    ] as const

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">关于我们管理</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'header' && <AboutHeaderManager />}
                {activeTab === 'intro' && <AboutIntroManager />}
                {activeTab === 'milestones' && <AboutMilestoneManager />}
                {activeTab === 'vision' && <AboutVisionManager />}
            </div>
        </div>
    )
}

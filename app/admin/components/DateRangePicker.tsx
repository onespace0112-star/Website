'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DateRangePicker() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const presets = [
        '今日',
        '昨日',
        '最近三天',
        '最近一周',
        '最近一个月',
        '最近三个月',
        '最近一年'
    ]

    // Mock Calendar Grid Generation
    const generateCalendarDays = (startDay: number, daysInMonth: number) => {
        const days = []
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            // Highlight random days for demo
            const isSelected = i === 13 || i === 24
            const isRange = i > 13 && i < 24

            days.push(
                <div
                    key={i}
                    className={`h-8 w-8 flex items-center justify-center text-xs cursor-pointer rounded-full transition-colors
                        ${isSelected ? 'bg-blue-500 text-white' : ''}
                        ${isRange ? 'bg-blue-50 text-blue-600 rounded-none' : ''}
                        ${!isSelected && !isRange ? 'hover:bg-gray-100 text-gray-700' : ''}
                    `}
                >
                    {i}
                </div>
            )
        }
        return days
    }

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Input */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center bg-gray-50 border border-gray-300 rounded overflow-hidden cursor-pointer hover:border-blue-400 transition-colors w-[280px]"
            >
                <div className="flex-1 px-3 py-1.5 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                    2024-09-13
                </div>
                <span className="text-gray-400">~</span>
                <div className="flex-1 px-3 py-1.5 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                    2024-10-24
                </div>
                <div className="px-2 text-gray-400 border-l border-gray-300 py-1.5 bg-white">
                    <CalendarIcon size={14} />
                </div>
            </div>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex overflow-hidden animate-fade-in-up w-[680px]">
                    {/* Left Sidebar: Presets */}
                    <div className="w-32 border-r border-gray-100 bg-gray-50/50 p-2 flex flex-col gap-1">
                        {presets.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setSelectedPreset(preset)}
                                className={`text-left px-3 py-2 text-xs rounded hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all
                                    ${selectedPreset === preset ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-600'}
                                `}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>

                    {/* Right: Calendars */}
                    <div className="flex-1 p-4">
                        <div className="flex gap-8">
                            {/* Calendar 1 */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <button className="text-gray-400 hover:text-gray-600"><ChevronLeft size={16} /></button>
                                    <span className="text-sm font-bold text-gray-700">2024年9月</span>
                                    <div className="w-4" />
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                                        <div key={d} className="text-xs text-gray-400 font-medium">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1 gap-x-0 justify-items-center">
                                    {generateCalendarDays(0, 30)}
                                </div>
                            </div>

                            {/* Calendar 2 */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="w-4" />
                                    <span className="text-sm font-bold text-gray-700">2024年10月</span>
                                    <button className="text-gray-400 hover:text-gray-600"><ChevronRight size={16} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                                        <div key={d} className="text-xs text-gray-400 font-medium">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1 gap-x-0 justify-items-center">
                                    {generateCalendarDays(2, 31)}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm shadow-blue-500/20"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

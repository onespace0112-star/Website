'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PHONE_CODES } from '@/lib/constants'
import { ChevronDown, Check } from 'lucide-react'

interface AreaCodeSelectorProps {
    value: string
    onChange: (value: string) => void
    className?: string
    buttonClassName?: string
    placeholder?: string
}

export default function AreaCodeSelector({ value, onChange, className = '', buttonClassName = '', placeholder = 'Area' }: AreaCodeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedCode = PHONE_CODES.find(c => c.code === value) || { code: value || placeholder, country: '' }
    const isPlaceholder = !value

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all flex items-center justify-between gap-2 shadow-sm hover:border-[#c5a059]/50 font-['Microsoft_YaHei'] ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`truncate font-medium ${isPlaceholder ? 'text-gray-400' : ''}`}>{selectedCode.code}</span>
                    <span className="text-gray-600 text-xs truncate max-w-[120px] hidden md:block">{selectedCode.country}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[280px] md:w-[320px] z-[9999] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in-up origin-top-left">
                    <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2.5 z-10">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Area Code</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                        {PHONE_CODES.map((item) => (
                            <button
                                key={item.country}
                                type="button"
                                onClick={() => {
                                    onChange(item.code)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${value === item.code
                                    ? 'bg-[#c5a059]/10 text-[#c5a059]'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`font-medium ${value === item.code ? 'font-bold' : ''}`}>{item.code}</span>
                                <span className="text-gray-400 text-xs truncate max-w-[160px] group-hover:text-gray-600 transition-colors">{item.country}</span>
                                {value === item.code && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

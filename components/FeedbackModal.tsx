'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Check, Image as ImageIcon, Send, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

type Props = {
    isOpen: boolean
    onClose: () => void
    user?: any
}

type IssueType = {
    id: number
    name: string
}

export default function FeedbackModal({ isOpen, onClose, user }: Props) {
    const { t } = useLanguage()
    const [isVisible, setIsVisible] = useState(false)

    const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
    const [typesLoading, setTypesLoading] = useState(false)
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
    const [description, setDescription] = useState('')
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchIssueTypes = async () => {
        setTypesLoading(true)
        try {
            const res = await fetch('/api/feedback/types', { cache: 'no-store' })
            if (!res.ok) throw new Error('failed to fetch feedback types')
            const data: IssueType[] = await res.json()
            setIssueTypes(data)
            setSelectedTypeId(prev => {
                if (prev && data.some((item) => item.id === prev)) return prev
                return data.length > 0 ? data[0].id : null
            })
        } catch (error) {
            setIssueTypes([])
            setSelectedTypeId(null)
        } finally {
            setTypesLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setIsVisible(true))
            fetchIssueTypes()
        } else {
            setIsVisible(false)
            // Reset state on close
            setTimeout(() => {
                setIsSuccess(false)
                setDescription('')
                setUploadedImage(null)
                setSelectedTypeId(null)
            }, 300)
        }
    }, [isOpen])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setUploadedImage(data.url)
            }
        } catch (error) {
            console.error('Upload error', error)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedTypeId || !description.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    typeId: selectedTypeId,
                    description,
                    customerName: user?.name || null,
                    contact: user?.phone || user?.email || null,
                    images: uploadedImage ? JSON.stringify([uploadedImage]) : null,
                    status: '待处理'
                })
            })

            if (res.ok) {
                setIsSuccess(true)
                setTimeout(() => onClose(), 2000)
            }
        } catch (error) {
            console.error('Submit error', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => {
            onClose()
        }, 300)
    }

    const isValid = !!selectedTypeId && description.trim().length > 0

    if (!isOpen) return null

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'bg-[#0F172A]/60 backdrop-blur-md' : 'bg-transparent pointer-events-none'}`}>
            <div
                className={`bg-white rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.2)] w-full max-w-[600px] overflow-hidden flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-20'
                    }`}
            >
                {/* Header */}
                <div className="bg-[#1E1B4B] px-8 py-6 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold tracking-tight">Feedback</h3>
                        <p className="text-[#E2B05E] text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-90">Quality Assurance</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all relative z-10">
                        <X size={18} />
                    </button>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2B05E]/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    {isSuccess ? (
                        <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Check size={40} strokeWidth={3} className="animate-in zoom-in duration-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Thank you!</h3>
                            <p className="text-slate-500 text-sm">Your feedback has been submitted successfully.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">TYPE:</label>
                                {typesLoading ? (
                                    <div className="h-10 flex items-center">
                                        <Loader2 size={18} className="animate-spin text-slate-400" />
                                    </div>
                                ) : issueTypes.length === 0 ? (
                                    <p className="text-sm text-slate-500">暂无可选反馈问题类型，请联系管理员添加。</p>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {issueTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedTypeId(type.id)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${selectedTypeId === type.id
                                                    ? 'bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-md'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {selectedTypeId === type.id && <Check size={14} className="inline mr-2 -mt-0.5" />}
                                                {type.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">IMAGE:</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${uploadedImage
                                            ? 'border-[#E2B05E] bg-[#E2B05E]/5'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        {uploadedImage ? (
                                            <div className="relative w-full h-full group">
                                                { }
                                                <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain p-2" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold px-3 py-1.5 border border-white/50 rounded-full">Change Image</span>
                                                </div>
                                            </div>
                                        ) : uploading ? (
                                            <Loader2 size={24} className="text-[#E2B05E] animate-spin" />
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="text-slate-300" />
                                                <p className="text-xs font-semibold text-slate-400">Drag & Drop or Click to Upload Image</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">DESC:</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please enter details based on the selected type"
                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E2B05E]/50 focus:border-[#E2B05E] transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="px-8 pb-8 flex gap-4">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || isSubmitting || uploading}
                            className="flex-1 py-3.5 bg-[#D4AF37] hover:bg-[#C5A028] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Submit</span>
                                    <Send size={14} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

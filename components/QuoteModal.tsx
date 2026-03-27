'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { COUNTRIES } from '@/lib/constants'
import { validateEmail, validatePhone, normalizePhone } from '@/lib/validation'
import AreaCodeSelector from './AreaCodeSelector'
import { toast } from 'sonner'

interface QuoteModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const { t, locale } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({})
    const [showRequiredHints, setShowRequiredHints] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    // Matches ContactClient state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        projectType: '',
        propertyType: '',
        expectedTimeline: '',
        surfaceArea: '',
        budgetRange: '',
        floorPlanStatus: '',
        role: '',
        contactMethod: '',
        contactTime: '',
        images: '',
        description: '',
        areaCode: ''
    })
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const countryWrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (countryWrapperRef.current && !countryWrapperRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const isBlank = (value: string) => !value || value.trim() === ''
    const isMissing = (value: string) => showRequiredHints && isBlank(value)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'email' || name === 'phone') {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }))
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const validateStep = (step: number): boolean => {
        if (step === 1) {
            if (isBlank(formData.name) || isBlank(formData.email) || isBlank(formData.phone) || isBlank(formData.country)) {
                setShowRequiredHints(true)
                toast.error('请先填写所有必填项后再提交')
                return false
            }
            if (!validateEmail(formData.email)) {
                const emailError = t.luxury.contactPage.form.invalidEmail || 'Invalid email format'
                setFieldErrors(prev => ({ ...prev, email: emailError }))
                toast.error(emailError)
                return false
            }
            const fullPhone = formData.areaCode ? `${formData.areaCode}${formData.phone}` : formData.phone
            if (!validatePhone(fullPhone)) {
                const phoneError = t.luxury.contactPage.form.invalidPhone || 'Invalid phone number'
                setFieldErrors(prev => ({ ...prev, phone: phoneError }))
                toast.error(phoneError)
                return false
            }
            return true
        }
        if (step === 2) {
            const step2Fields = [
                formData.projectType, formData.propertyType, formData.expectedTimeline,
                formData.surfaceArea, formData.budgetRange, formData.floorPlanStatus, formData.role
            ]
            if (step2Fields.some(f => isBlank(f))) {
                setShowRequiredHints(true)
                toast.error('请先填写所有必填项后再提交')
                return false
            }
            return true
        }
        if (step === 3) {
            if (isBlank(formData.contactMethod) || isBlank(formData.contactTime)) {
                setShowRequiredHints(true)
                toast.error('请先填写所有必填项后再提交')
                return false
            }
            return true
        }
        return true
    }

    const handleNext = () => {
        if (!validateStep(currentStep)) return
        setShowRequiredHints(false)
        setFieldErrors({})
        setCurrentStep(s => s + 1)
    }

    const handleBack = () => {
        setShowRequiredHints(false)
        setCurrentStep(s => s - 1)
    }

    const handleClose = () => {
        setCurrentStep(1)
        setShowRequiredHints(false)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep(3)) return
        setLoading(true)
        setFieldErrors({})

        const fullPhone = formData.areaCode ? `${formData.areaCode}${formData.phone}` : formData.phone
        const normalizedPhone = normalizePhone(fullPhone)
        const visitSource = (typeof window !== 'undefined' && window.sessionStorage?.getItem('onespace_visit_source')) || 'Direct'
        const submitData = { ...formData, phone: normalizedPhone, email: formData.email.trim(), source: visitSource }
        console.log('[QuoteModal] Submitting data:', submitData)

        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            })

            if (res.ok) {
                setSuccess(true)
                toast.success(t.luxury.contactPage.form.success || '提交成功！')
                setTimeout(() => {
                    setSuccess(false)
                    setCurrentStep(1)
                    onClose()
                    setFormData({
                        name: '', email: '', phone: '', country: '', projectType: '', description: '',
                        propertyType: '', expectedTimeline: '', surfaceArea: '', budgetRange: '',
                        floorPlanStatus: '', role: '', contactMethod: '', contactTime: '', images: '', areaCode: ''
                    })
                }, 2000)
            } else {
                const errorData = await res.json().catch(() => ({}))
                console.error('[QuoteModal] API error:', errorData)
                let errorMessage = errorData.error || t.luxury.contactPage.form.error || '提交失败，请稍后重试'
                if (errorData.missingFields && errorData.missingFields.length > 0) {
                    errorMessage += ` (缺失字段: ${errorData.missingFields.join(', ')})`
                }
                toast.error(errorMessage)
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('提交失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const stepLabels: Record<number, string> = {
        1: t.luxury.quoteForm.step1Label,
        2: t.luxury.quoteForm.step2Label,
        3: t.luxury.quoteForm.step3Label,
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 font-sans">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            />

            <div
                className={`relative w-full bg-white shadow-2xl overflow-y-auto scrollbar-hide max-h-[100dvh] md:max-h-[90vh] animate-fade-in-up transform transition-all duration-500 ease-in-out ${success ? 'max-w-[320px] rounded-2xl' : 'max-w-[1000px] h-full md:h-auto rounded-none md:rounded-2xl'
                    }`}
            >
                {/* Success Content */}
                {success ? (
                    <div className="flex flex-col items-center justify-center p-8 animate-fade-in min-h-[180px]">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 scale-110">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{t.luxury.contactPage.form.success}</h3>
                    </div>
                ) : (
                    <>
                        {/* Modal Header */}
                        <div className="px-5 py-5 md:px-10 md:pt-10 md:pb-6 bg-white shrink-0 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1a202c] leading-tight">{t.luxury.quoteForm.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">{t.luxury.quoteForm.subtitle}</p>

                                    {/* Step Indicator */}
                                    <div className="flex items-center mt-5">
                                        {[1, 2, 3].map((step, i) => (
                                            <React.Fragment key={step}>
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${currentStep > step ? 'bg-[#c5a059] border-[#c5a059] text-white' : currentStep === step ? 'border-[#c5a059] text-[#c5a059] bg-white' : 'border-gray-200 text-gray-300 bg-white'}`}>
                                                        {currentStep > step ? (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        ) : step}
                                                    </div>
                                                    <span className={`text-[12px] md:text-[18px] mt-1 font-medium whitespace-nowrap ${currentStep >= step ? 'text-[#c5a059]' : 'text-gray-300'}`}>
                                                        {stepLabels[step]}
                                                    </span>
                                                </div>
                                                {i < 2 && (
                                                    <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-300 ${currentStep > step ? 'bg-[#c5a059]' : 'bg-gray-200'}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full ml-4 mt-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-5 pb-5 md:px-10 md:pb-10 pt-6">
                            <form onSubmit={handleSubmit} noValidate>

                                {/* Step 1: Basic Info */}
                                {currentStep === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.name}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder={t.luxury.contactPage.form.placeholderName}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-gray-900 placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] pr-10 ${isMissing(formData.name) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'}`}
                                                    required
                                                />
                                                {formData.name && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, name: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone Group */}
                                        <div className="space-y-1.5 relative z-[120]">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.phone}
                                            </label>
                                            <div className="flex gap-2">
                                                {/* Area Code */}
                                                <div className="w-[90px] md:w-[200px] flex-shrink-0">
                                                    <AreaCodeSelector
                                                        value={formData.areaCode || ''}
                                                        onChange={(val) => setFormData({ ...formData, areaCode: val })}
                                                        placeholder={locale === 'zh' ? '区号' : 'Area'}
                                                        className="h-full"
                                                    />
                                                </div>
                                                {/* Phone Number */}
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder={t.luxury.contactPage.form.placeholderPhone}
                                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] pr-10 ${fieldErrors.phone || isMissing(formData.phone) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'}`}
                                                        aria-invalid={!!fieldErrors.phone}
                                                        required
                                                    />
                                                    {formData.phone && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, phone: '' })
                                                                setFieldErrors(prev => ({ ...prev, phone: undefined }))
                                                            }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {fieldErrors.phone && (
                                                <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.email}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder={t.luxury.contactPage.form.placeholderEmail}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] pr-10 ${fieldErrors.email || isMissing(formData.email) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'}`}
                                                    aria-invalid={!!fieldErrors.email}
                                                    required
                                                />
                                                {formData.email && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, email: '' })
                                                            setFieldErrors(prev => ({ ...prev, email: undefined }))
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                            {fieldErrors.email && (
                                                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                                            )}
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-1.5 relative z-[110]" ref={countryWrapperRef}>
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.country}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, country: e.target.value }))
                                                        setShowCountryDropdown(true)
                                                    }}
                                                    onFocus={() => setShowCountryDropdown(true)}
                                                    placeholder={t.luxury.contactPage.form.placeholderCountry}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] pr-10 ${isMissing(formData.country) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'}`}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                {formData.country && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, country: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-[10]"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                                {showCountryDropdown && (
                                                    <div className="absolute z-[120] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                                                        {COUNTRIES.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).length > 0 ? (
                                                            COUNTRIES.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).map((c) => (
                                                                <div
                                                                    key={c}
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, country: c }))
                                                                        setShowCountryDropdown(false)
                                                                    }}
                                                                    className="px-4 py-2 hover:bg-[#c5a059]/10 hover:text-[#c5a059] cursor-pointer text-sm text-gray-700"
                                                                >
                                                                    {/* @ts-expect-error dynamic locale map indexing */}
                                                                    {t.countryMap?.[c] || c}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-400 text-center">{t.luxury.contactPage.form.noCountryResults}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Project Details */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                                        {/* Project Type */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.projectType}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="projectType"
                                                    value={formData.projectType}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.projectType) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.projectType ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderProjectType}</option>
                                                    <option value="New Home Project">{t.luxury.contactPage.form.projectTypeOptions.newHome}</option>
                                                    <option value="Renovation">{t.luxury.contactPage.form.projectTypeOptions.renovation}</option>
                                                    <option value="Furniture Only">{t.luxury.contactPage.form.projectTypeOptions.furniture}</option>
                                                </select>
                                                {formData.projectType && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, projectType: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Property Type */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.propertyType}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="propertyType"
                                                    value={formData.propertyType}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.propertyType) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.propertyType ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderPropertyType}</option>
                                                    <option value="Villa">{t.luxury.contactPage.form.propertyTypeOptions.villa}</option>
                                                    <option value="Apartment">{t.luxury.contactPage.form.propertyTypeOptions.apartment}</option>
                                                    <option value="Other">{t.luxury.contactPage.form.propertyTypeOptions.other}</option>
                                                </select>
                                                {formData.propertyType && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, propertyType: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.expectedTimeline}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="expectedTimeline"
                                                    value={formData.expectedTimeline}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.expectedTimeline) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.expectedTimeline ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderExpectedTimeline}</option>
                                                    <option value="Ready to start now">{t.luxury.contactPage.form.expectedTimelineOptions.ready}</option>
                                                    <option value="Within 1–3 months">{t.luxury.contactPage.form.expectedTimelineOptions.oneToThree}</option>
                                                    <option value="Within 3–6 months">{t.luxury.contactPage.form.expectedTimelineOptions.threeToSix}</option>
                                                    <option value="No fixed timeline yet">{t.luxury.contactPage.form.expectedTimelineOptions.unknown}</option>
                                                </select>
                                                {formData.expectedTimeline && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, expectedTimeline: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Surface Area */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.surfaceArea}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="surfaceArea"
                                                    value={formData.surfaceArea}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.surfaceArea) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.surfaceArea ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderSurfaceArea}</option>
                                                    <option value="Below 200m²">{t.luxury.contactPage.form.surfaceAreaOptions.below200}</option>
                                                    <option value="200m² to 500m²">{t.luxury.contactPage.form.surfaceAreaOptions.twoToFive}</option>
                                                    <option value="Above 500m²">{t.luxury.contactPage.form.surfaceAreaOptions.above500}</option>
                                                </select>
                                                {formData.surfaceArea && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, surfaceArea: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Budget */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.budgetRange}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="budgetRange"
                                                    value={formData.budgetRange}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.budgetRange) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.budgetRange ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderBudgetRange}</option>
                                                    <option value="Below $50,000">{t.luxury.contactPage.form.budgetRangeOptions.below50k}</option>
                                                    <option value="$50,000 – $100,000">{t.luxury.contactPage.form.budgetRangeOptions.fiveToTen}</option>
                                                    <option value="Over $100,000">{t.luxury.contactPage.form.budgetRangeOptions.above100k}</option>
                                                    <option value="Prefer not to say yet">{t.luxury.contactPage.form.budgetRangeOptions.unknown}</option>
                                                </select>
                                                {formData.budgetRange && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, budgetRange: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Floor Plan */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.floorPlanStatus}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="floorPlanStatus"
                                                    value={formData.floorPlanStatus}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.floorPlanStatus) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.floorPlanStatus ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderFloorPlanStatus}</option>
                                                    <option value="Complete drawings available">{t.luxury.contactPage.form.floorPlanStatusOptions.available}</option>
                                                    <option value="Basic layout or measurements only">{t.luxury.contactPage.form.floorPlanStatusOptions.basic}</option>
                                                    <option value="Not available yet">{t.luxury.contactPage.form.floorPlanStatusOptions.none}</option>
                                                </select>
                                                {formData.floorPlanStatus && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, floorPlanStatus: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span className="text-red-500 mr-1">*</span>
                                                {t.luxury.contactPage.form.role}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.role) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.role ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                    required
                                                >
                                                    <option value="" disabled>{t.luxury.contactPage.form.placeholderRole}</option>
                                                    <option value="Property Owner">{t.luxury.contactPage.form.roleOptions.owner}</option>
                                                    <option value="Designer">{t.luxury.contactPage.form.roleOptions.designer}</option>
                                                    <option value="Other">{t.luxury.contactPage.form.roleOptions.other}</option>
                                                </select>
                                                {formData.role && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, role: '' })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Contact Preferences */}
                                {currentStep === 3 && (
                                    <div className="mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                                            {/* Contact Method */}
                                            <div className="space-y-1.5">
                                                <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                    <span className="text-red-500 mr-1">*</span>
                                                    {t.luxury.contactPage.form.contactMethod}
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="contactMethod"
                                                        value={formData.contactMethod}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.contactMethod) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.contactMethod ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                        required
                                                    >
                                                        <option value="" disabled>{t.luxury.contactPage.form.placeholderContactMethod}</option>
                                                        <option value="WhatsApp">{t.luxury.contactPage.form.contactMethodOptions.whatsapp}</option>
                                                        <option value="Phone call">{t.luxury.contactPage.form.contactMethodOptions.phone}</option>
                                                        <option value="Video call">{t.luxury.contactPage.form.contactMethodOptions.video}</option>
                                                        <option value="Email">{t.luxury.contactPage.form.contactMethodOptions.email}</option>
                                                        <option value="WeChat">{t.luxury.contactPage.form.contactMethodOptions.wechat}</option>
                                                    </select>
                                                    {formData.contactMethod && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, contactMethod: '' })}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Best Time */}
                                            <div className="space-y-1.5">
                                                <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                    <span className="text-red-500 mr-1">*</span>
                                                    {t.luxury.contactPage.form.contactTime}
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="contactTime"
                                                        value={formData.contactTime}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-[#d7d7d7] focus:bg-white focus:outline-none transition-all font-['Microsoft_YaHei'] appearance-none pr-10 ${isMissing(formData.contactTime) ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300' : 'border-gray-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'} ${formData.contactTime ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
                                                        required
                                                    >
                                                        <option value="" disabled>{t.luxury.contactPage.form.placeholderContactTime}</option>
                                                        <option value="Morning">{t.luxury.contactPage.form.contactTimeOptions.morning}</option>
                                                        <option value="Afternoon">{t.luxury.contactPage.form.contactTimeOptions.afternoon}</option>
                                                        <option value="Evening">{t.luxury.contactPage.form.contactTimeOptions.evening}</option>
                                                        <option value="Anytime">{t.luxury.contactPage.form.contactTimeOptions.anytime}</option>
                                                    </select>
                                                    {formData.contactTime && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, contactTime: '' })}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Notes */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">{t.luxury.contactPage.form.additionalNotes}</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder={t.luxury.contactPage.form.placeholderAdditionalNotes}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-[#d7d7d7] focus:bg-white focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all font-['Microsoft_YaHei'] appearance-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Footer / Form Actions */}
                                <div className="flex items-center justify-end gap-3 md:gap-4 pt-6 border-t border-gray-100">
                                    {showRequiredHints && (
                                        <p className="mr-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs md:text-sm font-medium text-red-600">
                                            请先完善所有带 * 的必填项，红框字段需先填写后再提交。
                                        </p>
                                    )}
                                    {currentStep === 1 && (
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                                        >
                                            {t.luxury.contactPage.form.cancel || 'Cancel'}
                                        </button>
                                    )}
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none flex items-center gap-1.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                            {t.luxury.quoteForm.back}
                                        </button>
                                    )}
                                    {currentStep < 3 && (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="px-8 py-3 text-sm font-bold text-white bg-[#c5a059] rounded-lg hover:bg-[#b08d4d] transition-all focus:outline-none shadow-lg shadow-[#c5a059]/20 flex items-center gap-1.5"
                                        >
                                            {t.luxury.quoteForm.next}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                    )}
                                    {currentStep === 3 && (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 text-sm font-bold text-white bg-[#c5a059] rounded-lg hover:bg-[#b08d4d] transition-all focus:outline-none shadow-lg shadow-[#c5a059]/20 flex items-center gap-2"
                                        >
                                            {loading && (
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {t.luxury.contactPage.form.submit}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

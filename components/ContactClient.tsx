'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, Fragment } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useQuoteModal } from '@/lib/QuoteModalContext'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { useAuth } from '@/lib/AuthContext'
import { startTransition } from 'react'
import { COUNTRIES, PHONE_CODES } from '@/lib/constants'
import { validateEmail, validatePhone, normalizePhone } from '@/lib/validation'
import { toast } from 'sonner'

import PageBanner from './PageBanner'
import AreaCodeSelector from './AreaCodeSelector'
import { useZhRuntimeTranslator } from '@/lib/useZhRuntimeTranslator'

export default function ContactClient() {
    const { t, locale } = useLanguage()
    const { openQuoteModal } = useQuoteModal()
    const { user, loading, requireAuth } = useAuth()
    const { translate, preload } = useZhRuntimeTranslator(locale, {})
    const DRAFT_KEY = 'contact_form_draft_v1'
    const RESUME_SUBMIT_KEY = 'contact_form_resume_submit_v1'
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
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({})
    const [showRequiredHints, setShowRequiredHints] = useState(false)
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
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

    // Restore draft after login redirect so user can continue from current page.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const draft = window.sessionStorage.getItem(DRAFT_KEY)
        if (!draft) return
        try {
            const parsed = JSON.parse(draft)
            setFormData(prev => ({ ...prev, ...parsed }))
        } catch {
            // Ignore malformed draft data.
        }
    }, [])

    const submitInquiry = async (payload: typeof formData) => {
        const fullPhone = payload.areaCode ? `${payload.areaCode}${payload.phone}` : payload.phone
        const normalizedPhone = normalizePhone(fullPhone)
        const visitSource = (typeof window !== 'undefined' && window.sessionStorage?.getItem('onespace_visit_source')) || 'Direct'
        const submitData = { ...payload, phone: normalizedPhone, email: payload.email.trim(), source: visitSource }
        console.log('[ContactClient] Submitting data:', submitData)

        setStatus('submitting')
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            })
            if (res.ok) {
                setStatus('success')
                setCurrentStep(1)
                toast.success(t.luxury.contactPage.form.success || '提交成功！')
                setFormData({
                    name: '', email: '', phone: '', country: '', projectType: '', description: '',
                    propertyType: '', expectedTimeline: '', surfaceArea: '', budgetRange: '',
                    floorPlanStatus: '', role: '', contactMethod: '', contactTime: '', images: '', areaCode: ''
                })
                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem(DRAFT_KEY)
                    window.sessionStorage.removeItem(RESUME_SUBMIT_KEY)
                }
                // Hide status after 2 seconds
                setTimeout(() => {
                    setStatus('idle')
                }, 2000)
            } else {
                const errorData = await res.json().catch(() => ({}))
                console.error('[ContactClient] API error:', errorData)
                setStatus('error')
                let errorMessage = errorData.error || t.luxury.contactPage.form.error || '提交失败，请稍后重试'
                if (errorData.missingFields && errorData.missingFields.length > 0) {
                    errorMessage += ` (缺失字段: ${errorData.missingFields.join(', ')})`
                }
                toast.error(errorMessage)
            }
        } catch (err) {
            console.error('Submit error:', err)
            setStatus('error')
            toast.error('提交失败，请稍后重试')
        }
    }

    // Auto-submit once user returns from login.
    useEffect(() => {
        if (typeof window === 'undefined' || loading || !user) return
        const shouldResume = window.sessionStorage.getItem(RESUME_SUBMIT_KEY) === '1'
        if (!shouldResume) return
        const draft = window.sessionStorage.getItem(DRAFT_KEY)
        if (!draft) {
            window.sessionStorage.removeItem(RESUME_SUBMIT_KEY)
            return
        }
        try {
            const parsed = JSON.parse(draft)
            window.sessionStorage.removeItem(RESUME_SUBMIT_KEY)
            void submitInquiry(parsed)
        } catch {
            window.sessionStorage.removeItem(RESUME_SUBMIT_KEY)
        }
    }, [loading, user])

    const validateStep = (step: number): boolean => {
        if (step === 1) {
            if (isBlank(formData.name) || isBlank(formData.email) || isBlank(formData.phone) || isBlank(formData.country)) {
                setShowRequiredHints(true)
                toast.error('请先填写所有必填项后再提交')
                return false
            }
            if (!validateEmail(formData.email)) {
                const emailError = t.luxury?.contactPage?.form?.invalidEmail || 'Invalid email format'
                setFieldErrors(prev => ({ ...prev, email: emailError }))
                toast.error(emailError)
                return false
            }
            const fullPhone = formData.areaCode ? `${formData.areaCode}${formData.phone}` : formData.phone
            if (!validatePhone(fullPhone)) {
                const phoneError = t.luxury?.contactPage?.form?.invalidPhone || 'Invalid phone number'
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep(3)) return
        setFieldErrors({})

        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
            if (!user) {
                window.sessionStorage.setItem(RESUME_SUBMIT_KEY, '1')
            }
        }

        requireAuth(() => {
            void submitInquiry(formData)
        })
    }

    const [companyInfo, setCompanyInfo] = useState<{
        mapImageEn?: string | null
        mapImageZh?: string | null
        companyName?: string | null
        companyAddress?: string | null
        companyEmail?: string | null
        companyPhone?: string | null
        companyWebsite?: string | null
    } | null>(null)

    useEffect(() => {
        let active = true
        const fetchCompanyInfo = async () => {
            try {
                const res = await fetch('/api/company-info', { cache: 'no-store' })
                if (!res.ok) return
                const data = await res.json()
                if (active) setCompanyInfo(data && typeof data === 'object' ? data : null)
            } catch { }
        }
        fetchCompanyInfo()
        const interval = window.setInterval(fetchCompanyInfo, 15000)
        const handleFocus = () => fetchCompanyInfo()
        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleFocus)
        return () => {
            active = false
            window.clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleFocus)
        }
    }, [])

    const companyName = companyInfo?.companyName || (locale === 'zh' ? '佛山壹空间家居设计有限公司' : 'Foshan One Space Home Design Co., Ltd')
    const addressText = companyInfo?.companyAddress || (locale === 'zh'
        ? '广东省佛山市顺德区乐从镇 乐从辉煌供销总部大厦'
        : 'Lecong Huihuang Supply Headquarters Building, Lecong Town, Shunde District, Foshan City, Guangdong Province')
    const mapImage = locale === 'zh'
        ? (companyInfo?.mapImageZh || '/images/contact-map-zh.png')
        : (companyInfo?.mapImageEn || '/images/contact-map-en.png')

    const emailText = companyInfo?.companyEmail || 'onespacecn@gmail.com'
    const phoneText = companyInfo?.companyPhone || '+86 18126679031'
    const websiteText = companyInfo?.companyWebsite || 'https://onespacecn.com/'
    const normalizeBrandName = (text: string) => text.replace(/一\s*空间/g, '壹空间')
    const translatedCompanyName = locale === 'zh'
        ? normalizeBrandName(translate(companyName))
        : companyName
    const translatedAddress = locale === 'zh' ? translate(addressText) : addressText

    useEffect(() => {
        if (locale !== 'zh') return
        preload([companyName, addressText].filter(Boolean))
    }, [locale, companyName, addressText, preload])

    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const handleCopy = async (value: string, label: string, key: string) => {
        try {
            await navigator.clipboard.writeText(value)
            toast.success(locale === 'zh' ? `${label}已复制` : `${label} copied`)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 2000)
        } catch {
            toast.error(locale === 'zh' ? '复制失败，请手动复制' : 'Copy failed, please copy manually')
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
            {/* ======== HEADER ======== */}
            <SiteHeader />

            {/* ======== HERO SECTION ======== */}
            <PageBanner
                page="inquiry"
                fallbackTitle={t.luxury.contactPage.title}
                fallbackDesc={t.luxury.contactPage.subtitle}
                fallbackImage="/images/hero_luxury_house.png"
            />


            {/* ======== CONTACT MAP SECTION ======== */}
            <section className="py-6 md:py-16 px-4 md:px-6">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 md:px-10 pt-6 md:pt-10 pb-4 text-center">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#0F172A]">
                            {locale === 'zh' ? '联系我们' : 'Contact Us'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-10 items-center">
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-[320px] md:h-[400px] relative">
                            <img
                                src={mapImage}
                                alt={addressText}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="space-y-5 md:space-y-6 text-sm md:text-base text-gray-700">
                            <div className="flex gap-3">
                                <span className="text-[#1e40af]">🏢</span>
                                <div>
                                    <div className="font-semibold text-[#0F172A]">{translatedCompanyName}</div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#1e40af]">📍</span>
                                <div>{translatedAddress}</div>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[#1e40af]">✉️</span>
                                    <span>{emailText}</span>
                                </div>
                                {copiedKey === 'email' ? (
                                    <span key="copied-email" className="text-xs text-green-600 inline-flex items-center gap-1 [animation:fadeInOut_2s_ease-in-out_forwards]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        {locale === 'zh' ? '复制成功' : 'Copy successful'}
                                    </span>
                                ) : (
                                    <button key="btn-email" type="button" onClick={() => handleCopy(emailText, '邮箱', 'email')} className="text-[#1e40af] text-xs cursor-pointer transition-opacity duration-300 hover:opacity-70">
                                        {locale === 'zh' ? '复制' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[#1e40af]">📞</span>
                                    <span>{phoneText}</span>
                                </div>
                                {copiedKey === 'phone' ? (
                                    <span key="copied-phone" className="text-xs text-green-600 inline-flex items-center gap-1 [animation:fadeInOut_2s_ease-in-out_forwards]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        {locale === 'zh' ? '复制成功' : 'Copy successful'}
                                    </span>
                                ) : (
                                    <button key="btn-phone" type="button" onClick={() => handleCopy(phoneText, '电话', 'phone')} className="text-[#1e40af] text-xs cursor-pointer transition-opacity duration-300 hover:opacity-70">
                                        {locale === 'zh' ? '复制' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[#1e40af]">🌐</span>
                                    <span>{websiteText}</span>
                                </div>
                                {copiedKey === 'website' ? (
                                    <span key="copied-website" className="text-xs text-green-600 inline-flex items-center gap-1 [animation:fadeInOut_2s_ease-in-out_forwards]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        {locale === 'zh' ? '复制成功' : 'Copy successful'}
                                    </span>
                                ) : (
                                    <button key="btn-website" type="button" onClick={() => handleCopy(websiteText, '网站', 'website')} className="text-[#1e40af] text-xs cursor-pointer transition-opacity duration-300 hover:opacity-70">
                                        {locale === 'zh' ? '复制' : 'Copy'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== CONTACT FORM SECTION ======== */}
            <section className="py-12 md:py-24 px-6 bg-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="bg-[#F1F5F9]/50 backdrop-blur-xl p-6 md:p-16 rounded-3xl md:rounded-[40px] border border-gray-200/50 shadow-2xl" data-aos="fade-up">
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#0F172A] mb-3 md:mb-4" data-aos="fade-in">
                                {t.luxury.contactPage.form.title}
                            </h2>
                            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto" data-aos="fade-in" data-aos-delay="100">
                                {t.luxury.contactPage.form.subtitle}
                            </p>
                            {/* Step Indicator */}
                            <div className="flex items-center justify-center mt-6">
                                <div className="flex items-center gap-0 w-full max-w-sm">
                                    {[1, 2, 3].map((step, i) => (
                                        <Fragment key={step}>
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${currentStep > step ? 'bg-[#c5a059] border-[#c5a059] text-white' : currentStep === step ? 'border-[#c5a059] text-[#c5a059] bg-white' : 'border-gray-300 text-gray-300 bg-white'}`}>
                                                    {currentStep > step ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                    ) : step}
                                                </div>
                                                <span className={`text-[12px] md:text-[18px] mt-1 font-medium whitespace-nowrap ${currentStep >= step ? 'text-[#c5a059]' : 'text-gray-300'}`}>
                                                    {step === 1 ? t.luxury.quoteForm.step1Label : step === 2 ? t.luxury.quoteForm.step2Label : t.luxury.quoteForm.step3Label}
                                                </span>
                                            </div>
                                            {i < 2 && (
                                                <div className={`flex-1 h-px mx-3 mb-4 transition-all duration-300 ${currentStep > step ? 'bg-[#c5a059]' : 'bg-gray-200'}`} />
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8" noValidate>
                            {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                {/* Name */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up" data-aos-delay="200">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.name || 'Name'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder={t.luxury.contactPage.form.placeholderName}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none transition-all text-sm md:text-base text-gray-700 shadow-sm placeholder-[#d7d7d7] font-['Microsoft_YaHei'] pr-10 ${isMissing(formData.name) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'}`}
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

                                {/* Phone/WA */}
                                <div className="space-y-2 md:space-y-3 relative z-[120]" data-aos="fade-up" data-aos-delay="250">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.phone || 'Phone / WhatsApp'}
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="w-[90px] md:w-[200px] flex-shrink-0">
                                            <AreaCodeSelector
                                                value={formData.areaCode || ''}
                                                onChange={(val) => setFormData({ ...formData, areaCode: val })}
                                                placeholder={locale === 'zh' ? '区号' : 'Area'}
                                                className="h-full"
                                                buttonClassName="rounded-xl md:rounded-2xl border-[#d7d7d7] text-[#7d7d7d] md:text-base px-4 py-3 md:px-6 md:py-4"
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                required
                                                type="text"
                                                placeholder={t.luxury.contactPage.form.placeholderPhone}
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, phone: e.target.value })
                                                    setFieldErrors(prev => ({ ...prev, phone: undefined }))
                                                }}
                                                className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none transition-all text-sm md:text-base text-gray-700 shadow-sm placeholder-[#d7d7d7] font-['Microsoft_YaHei'] pr-10 ${fieldErrors.phone || isMissing(formData.phone) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'}`}
                                                aria-invalid={!!fieldErrors.phone}
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
                                        <p className="text-xs text-red-500 ml-2">{fieldErrors.phone}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up" data-aos-delay="300">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.email || 'Email Address'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            inputMode="email"
                                            placeholder={t.luxury.contactPage.form.placeholderEmail}
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value })
                                                setFieldErrors(prev => ({ ...prev, email: undefined }))
                                            }}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none transition-all text-sm md:text-base text-gray-700 shadow-sm placeholder-[#d7d7d7] font-['Microsoft_YaHei'] pr-10 ${fieldErrors.email || isMissing(formData.email) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'}`}
                                            aria-invalid={!!fieldErrors.email}
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
                                        <p className="text-xs text-red-500 ml-2">{fieldErrors.email}</p>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="space-y-2 md:space-y-3 relative z-[110]" data-aos="fade-up" data-aos-delay="350" ref={countryWrapperRef}>
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.country || 'Project Location (Country)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder={t.luxury.contactPage.form.placeholderCountry}
                                            value={formData.country}
                                            onChange={(e) => {
                                                setFormData({ ...formData, country: e.target.value })
                                                setShowCountryDropdown(true)
                                            }}
                                            onFocus={() => setShowCountryDropdown(true)}
                                            autoComplete="new-password"
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none transition-all text-sm md:text-base text-gray-700 shadow-sm placeholder-[#d7d7d7] font-['Microsoft_YaHei'] pr-10 ${isMissing(formData.country) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'}`}
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
                                    </div>
                                    {showCountryDropdown && (
                                        <div className="absolute z-[120] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto">
                                            {COUNTRIES.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).map((c) => (
                                                <div
                                                    key={c}
                                                    onClick={() => {
                                                        setFormData({ ...formData, country: c })
                                                        setShowCountryDropdown(false)
                                                    }}
                                                    className="px-4 py-2 hover:bg-[#c5a059]/10 hover:text-[#c5a059] cursor-pointer text-gray-700"
                                                >
                                                    {/* @ts-expect-error dynamic locale map indexing */}
                                                    {t.countryMap?.[c] || c}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}
                            {currentStep === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

                                {/* Project Type */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.projectType}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.projectType}
                                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.projectType) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.projectType ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.propertyType}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.propertyType}
                                            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.propertyType) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.propertyType ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Expected Start Timeline */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.expectedTimeline}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.expectedTimeline}
                                            onChange={(e) => setFormData({ ...formData, expectedTimeline: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.expectedTimeline) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.expectedTimeline ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Estimated Surface Area */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.surfaceArea}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.surfaceArea}
                                            onChange={(e) => setFormData({ ...formData, surfaceArea: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.surfaceArea) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.surfaceArea ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Estimated Budget Range */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.budgetRange}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.budgetRange}
                                            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.budgetRange) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.budgetRange ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Floor Plan / Measurements */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.floorPlanStatus}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.floorPlanStatus}
                                            onChange={(e) => setFormData({ ...formData, floorPlanStatus: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.floorPlanStatus) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.floorPlanStatus ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Your Role */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.role}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.role) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.role ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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
                            {currentStep === 3 && (<>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

                                {/* Preferred Contact Method */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.contactMethod}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.contactMethod}
                                            onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.contactMethod) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.contactMethod ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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

                                {/* Best Time to Contact */}
                                <div className="space-y-2 md:space-y-3" data-aos="fade-up">
                                    <label className="text-xs md:text-sm font-bold text-[#475569] uppercase tracking-wider ml-2 flex items-center gap-1">
                                        <span className="text-red-500">*</span> {t.luxury.contactPage.form.contactTime}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.contactTime}
                                            onChange={(e) => setFormData({ ...formData, contactTime: e.target.value })}
                                            className={`w-full bg-white border px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl focus:outline-none text-sm md:text-base shadow-sm appearance-none pr-10 ${isMissing(formData.contactTime) ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-400' : 'border-[#d7d7d7] focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'} ${formData.contactTime ? 'text-gray-700' : 'text-[#d7d7d7]'}`}
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
                            <div className="space-y-3" data-aos="fade-up">
                                <label className="text-sm font-bold text-[#475569] uppercase tracking-wider ml-2">
                                    {t.luxury.contactPage.form.additionalNotes}
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder={t.luxury.contactPage.form.placeholderAdditionalNotes}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white border border-[#d7d7d7] px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059] transition-all text-sm md:text-base text-gray-700 shadow-sm resize-none"
                                />
                            </div>
                            </>)}

                            {/* Navigation */}
                            <div className="flex flex-col items-center pt-8" data-aos="fade-up" data-aos-delay="450">
                                {showRequiredHints && (
                                    <p className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                                        请先完善所有带 * 的必填项，红框字段需先填写后再提交。
                                    </p>
                                )}
                                <div className="flex gap-4">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="px-8 py-3 md:px-12 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                            {t.luxury.quoteForm.back}
                                        </button>
                                    )}
                                    {currentStep < 3 && (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="relative overflow-hidden bg-[#c5a059] text-white px-8 py-3 md:px-12 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-bold hover:bg-[#a68648] hover:scale-105 transition-all shadow-xl shadow-[#c5a059]/30 group flex items-center gap-1.5"
                                        >
                                            <span className="relative z-10 flex items-center gap-1.5">
                                                {t.luxury.quoteForm.next}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </span>
                                            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </button>
                                    )}
                                    {currentStep === 3 && (
                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="relative overflow-hidden bg-[#c5a059] text-white px-10 py-3 md:px-20 md:py-5 rounded-xl md:rounded-2xl text-base md:text-xl font-bold hover:bg-[#a68648] hover:scale-105 transition-all shadow-xl shadow-[#c5a059]/30 disabled:opacity-50 group"
                                        >
                                            <span className="relative z-10">
                                                {status === 'submitting' ? t.luxury.contactPage.form.submitting : t.luxury.contactPage.form.submit}
                                            </span>
                                            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Floating Success Toast */}
                {status === 'success' && (
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white px-10 py-6 rounded-xl shadow-2xl border border-green-100 flex items-center gap-4 animate-fade-in-up">
                        <div className="bg-green-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-green-800 font-bold text-lg">
                            {t.luxury.contactPage.form.success}
                        </p>
                    </div>
                )}
            </section>

            {/* ======== CTA SECTION (Synced with Prototype) ======== */}
            <section className="py-5 md:py-24 px-6 bg-white" data-aos="fade-up">
                <div className="max-w-6xl mx-auto rounded-[40px] overflow-hidden relative shadow-2xl group">
                    <img src="/images/hero_luxury_house.png" className="w-full h-[400px] object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8 md:p-16 text-center">
                        <div className="max-w-4xl">
                            <h2 className="text-[20px] md:text-5xl font-serif font-bold text-white mb-8 drop-shadow-lg" data-aos="zoom-in" data-aos-delay="200">
                                {t.luxury.faqPage.ctaTitle}
                            </h2>
                            <div className="w-20 h-1 bg-[#0ea5e9] mx-auto mb-8 rounded-full" />
                            <p className="text-lg md:text-xl text-gray-100 font-medium leading-relaxed drop-shadow-md" data-aos="fade-up" data-aos-delay="300">
                                {t.luxury.faqPage.ctaSubtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== FOOTER ======== */}
            <SiteFooter />

            {/* ======== QUOTE MODAL (Handled Globally) ======== */}
        </div>
    )
}

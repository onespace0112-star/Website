'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

// ─── Calendar Picker ─────────────────────────────────────────────
function CalendarPicker({
  value,
  onChange,
  isZh,
  hasError,
}: {
  value: string
  onChange: (date: string) => void
  isZh: boolean
  hasError: boolean
}) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const daysZh = ['日', '一', '二', '三', '四', '五', '六']
  const daysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

  const cells: { day: number; current: boolean; dateStr: string; disabled: boolean }[] = []
  // prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const m = viewMonth - 1
    const y = m < 0 ? viewYear - 1 : viewYear
    const mm = ((m % 12) + 12) % 12
    const dateStr = `${y}-${String(mm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, current: false, dateStr, disabled: true })
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(viewYear, viewMonth, d)
    cells.push({ day: d, current: true, dateStr, disabled: dateObj < today })
  }
  // next month padding
  const remain = 42 - cells.length
  for (let d = 1; d <= remain; d++) {
    const m = viewMonth + 1
    const y = m > 11 ? viewYear + 1 : viewYear
    const mm = m % 12
    const dateStr = `${y}-${String(mm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, current: false, dateStr, disabled: true })
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  const displayValue = value
    ? (() => {
      const [y, m, d] = value.split('-')
      return isZh ? `${y}年${parseInt(m)}月${parseInt(d)}日` : `${monthsEn[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
    })()
    : ''

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-lg bg-[#1a1a1a] text-base cursor-pointer text-left
          border outline-none transition-all duration-300 flex items-center justify-between
          ${hasError ? 'border-red-500' : 'border-white/10'}
          ${value ? 'text-gray-200' : 'text-gray-500'}
          hover:border-white/30 focus:border-[#c5a059]`}
      >
        <span>{displayValue || (isZh ? '请选择出行日期' : 'Select travel date')}</span>
        <svg className="w-5 h-5 text-[#c5a059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </button>

      {/* Dropdown Calendar */}
      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 right-0 bg-[#1a1a1a] border border-white/15 rounded-xl shadow-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewYear(viewYear - 1)} className="p-1 text-gray-500 hover:text-[#c5a059] transition-colors cursor-pointer text-sm">&laquo;</button>
            <button type="button" onClick={prevMonth} className="p-1 text-gray-500 hover:text-[#c5a059] transition-colors cursor-pointer text-sm">&lsaquo;</button>
            <span className="text-base font-medium text-white">
              {isZh ? `${viewYear}年 ${viewMonth + 1}月` : `${monthsEn[viewMonth]} ${viewYear}`}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 text-gray-500 hover:text-[#c5a059] transition-colors cursor-pointer text-sm">&rsaquo;</button>
            <button type="button" onClick={() => setViewYear(viewYear + 1)} className="p-1 text-gray-500 hover:text-[#c5a059] transition-colors cursor-pointer text-sm">&raquo;</button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {(isZh ? daysZh : daysEn).map((d) => (
              <div key={d} className="text-center text-xs text-gray-500 py-1.5 font-medium">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isSelected = cell.dateStr === value
              const isToday = cell.current && cell.dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
              return (
                <button
                  key={i}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => {
                    onChange(cell.dateStr)
                    setOpen(false)
                  }}
                  className={`
                    py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer
                    ${!cell.current ? 'text-gray-700 cursor-default' : ''}
                    ${cell.current && cell.disabled ? 'text-gray-600 cursor-not-allowed' : ''}
                    ${cell.current && !cell.disabled && !isSelected ? 'text-gray-300 hover:bg-white/10' : ''}
                    ${isSelected ? 'bg-[#c5a059] text-black font-bold' : ''}
                    ${isToday && !isSelected ? 'ring-1 ring-[#c5a059]/50 text-[#c5a059]' : ''}
                  `}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────
type DesignPkg = {
  id: number
  serviceType: string
  houseArea: string
  fee: string
  serviceItems: string
  sortOrder: number
}

type ProcurementPkg = {
  id: number
  serviceType: string
  fee: string
  serviceItems: string
  sortOrder: number
}

// ─── Helpers ─────────────────────────────────────────────────────
const zhLabels: Record<string, string> = {
  'Experience Package': '体验套餐',
  'Standard': '标准套餐',
  'Premium': '高级套餐',
  'Procurement Services': '采购服务',
}

function getLabel(serviceType: string, isZh: boolean) {
  return (isZh && zhLabels[serviceType]) || serviceType
}

function getFeeZh(fee: string) {
  return fee.replace(/Day/g, '天')
}

/** Parse serviceItems text. Supports bilingual format: "English text | 中文文本" per line */
function parseItems(raw: string, isZh: boolean): string[] {
  return raw.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
    const parts = line.split('|')
    return parts.length >= 2 ? (isZh ? parts[1].trim() : parts[0].trim()) : line
  })
}

// ─── Main Component ──────────────────────────────────────────────
type ServiceSystemSectionProps = {
  locale: string
}

export default function ServiceSystemSection({ locale }: ServiceSystemSectionProps) {
  const isZh = locale === 'zh'
  const [activeTab, setActiveTab] = useState<'design' | 'procurement'>('design')

  const [designPkgs, setDesignPkgs] = useState<DesignPkg[]>([])
  const [procurementPkgs, setProcurementPkgs] = useState<ProcurementPkg[]>([])
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null)
  const [selectedProcurementId, setSelectedProcurementId] = useState<number | null>(null)

  const [selectedDate, setSelectedDate] = useState<Record<number, string>>({})
  const [dateError, setDateError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderMsg, setOrderMsg] = useState<{ type: string; text: string } | null>(null)

  // Fetch packages from API
  useEffect(() => {
    fetch('/api/service-packages?category=design')
      .then(r => r.ok ? r.json() : [])
      .then((data: DesignPkg[]) => {
        setDesignPkgs(data)
        if (data.length > 0) setSelectedDesignId(data[0].id)
      })
      .catch(() => { })

    fetch('/api/service-packages?category=procurement')
      .then(r => r.ok ? r.json() : [])
      .then((data: ProcurementPkg[]) => {
        setProcurementPkgs(data)
        if (data.length > 0) setSelectedProcurementId(data[0].id)
      })
      .catch(() => { })
  }, [])

  const currentDesign = designPkgs.find(p => p.id === selectedDesignId)
  const currentProcurement = procurementPkgs.find(p => p.id === selectedProcurementId)

  const submitOrder = async (category: 'design' | 'procurement') => {
    setSubmitting(true)
    setOrderMsg(null)
    try {
      const body: Record<string, string> = { serviceCategory: category }
      if (category === 'design' && currentDesign) {
        body.serviceType = currentDesign.serviceType
        body.houseArea = currentDesign.houseArea || currentDesign.serviceType
        body.fee = currentDesign.fee
        body.serviceItems = currentDesign.serviceItems
      } else if (category === 'procurement' && currentProcurement) {
        body.serviceType = currentProcurement.serviceType
        body.fee = currentProcurement.fee
        body.serviceItems = currentProcurement.serviceItems
        body.travelDate = selectedDate[currentProcurement.id] || ''
      }

      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        setOrderMsg({ type: 'error', text: isZh ? '请先登录后再购买，正在跳转...' : 'Please login first, redirecting...' })
        setTimeout(() => {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        }, 1500)
      } else if (res.ok) {
        setOrderMsg({ type: 'success', text: isZh ? '支付成功\nThank you for your support. We will contact you within 24 hours.' : 'Payment Successful\nThank you for your support. We will contact you within 24 hours.' })
      } else {
        setOrderMsg({ type: 'error', text: isZh ? '提交失败，请稍后重试' : 'Submission failed, please try again' })
      }
    } catch {
      setOrderMsg({ type: 'error', text: isZh ? '网络错误，请稍后重试' : 'Network error, please try again' })
    }
    setSubmitting(false)
    setTimeout(() => setOrderMsg(null), 4000)
  }

  return (
    <section className="py-16 px-6" data-aos="fade-up">
      {/* Order Message Toast — rendered via portal to avoid AOS transform breaking fixed positioning */}
      {orderMsg && typeof document !== 'undefined' && createPortal(
        <>
          {/* 半透明遮罩 */}
          <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />
          {/* 弹窗 */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-md">
            <div className={`rounded-2xl border px-8 py-10 text-center shadow-2xl backdrop-blur-md ${orderMsg.type === 'success'
                ? 'bg-[#0d1f0d]/90 border-green-500/30'
                : 'bg-[#1f0d0d]/90 border-red-500/30'
              }`}>
              {/* 图标 */}
              <div className={`mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center ${orderMsg.type === 'success' ? 'bg-green-500/20 ring-2 ring-green-400/50' : 'bg-red-500/20 ring-2 ring-red-400/50'
                }`}>
                {orderMsg.type === 'success' ? (
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              {/* 标题 */}
              <h3 className={`text-xl font-bold mb-3 ${orderMsg.type === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                {orderMsg.type === 'success'
                  ? (orderMsg.text.includes('支付成功') ? '支付成功' : 'Payment Successful')
                  : (orderMsg.text.includes('失败') || orderMsg.text.includes('错误') ? '操作失败' : 'Error')}
              </h3>
              {/* 分隔线 */}
              <div className={`mx-auto w-12 h-0.5 rounded-full mb-4 ${orderMsg.type === 'success' ? 'bg-green-500/40' : 'bg-red-500/40'
                }`} />
              {/* 副文字 */}
              <p className="text-sm text-gray-300 leading-relaxed">
                {orderMsg.type === 'success'
                  ? (orderMsg.text.includes('支付成功')
                    ? '感谢您的支持，我们将在 24 小时内与您联系。'
                    : 'Thank you for your support. We will contact you within 24 hours.')
                  : orderMsg.text.replace(/^(支付成功|Payment Successful)\n?/, '')}
              </p>
            </div>
          </div>
        </>,
        document.body
      )}

      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="section-title-wrap mb-12">
          <h2
            className="text-4xl md:text-5xl font-serif text-center px-4 uppercase tracking-wider"
            data-aos="fade-in"
          >
            {isZh ? <>Onespace <span className="text-gold-gradient">服务体系</span></> : <>Onespace <span className="text-gold-gradient">Service System</span></>}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10" data-aos="fade-up">
          <div className="inline-flex rounded-full border border-[#c5a059]/40 bg-[#141414] p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`px-8 py-3 rounded-full text-base font-medium transition-all duration-300 cursor-pointer ${activeTab === 'design'
                  ? 'bg-gradient-to-r from-[#c5a059] to-[#f1e0ac] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {isZh ? '设计服务' : 'Design Services'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('procurement')}
              className={`px-8 py-3 rounded-full text-base font-medium transition-all duration-300 cursor-pointer ${activeTab === 'procurement'
                  ? 'bg-gradient-to-r from-[#c5a059] to-[#f1e0ac] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {isZh ? '采购服务' : 'Procurement Services'}
            </button>
          </div>
        </div>

        {/* ═══════════ DESIGN TAB ═══════════ */}
        {activeTab === 'design' && (
          <div data-aos="fade-up">
            {designPkgs.length === 0 ? (
              <p className="text-center text-gray-500 py-10">{isZh ? '暂无服务' : 'No services available'}</p>
            ) : (
              <>
                {/* House Area Selection */}
                <div className="mb-10">
                  <h3 className="text-base uppercase tracking-widest text-[#c5a059] mb-5 text-center">
                    {isZh ? '选择房屋面积' : 'House Area'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {designPkgs.map((pkg) => (
                      <label
                        key={pkg.id}
                        className={`
                          relative flex items-center gap-2.5 px-6 py-3 rounded-full cursor-pointer
                          border transition-all duration-300 text-base
                          ${selectedDesignId === pkg.id
                            ? 'border-[#c5a059] bg-[#c5a059]/10 text-white shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                            : 'border-white/10 bg-[#141414] text-gray-400 hover:border-white/30 hover:text-white'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="designArea"
                          value={pkg.id}
                          checked={selectedDesignId === pkg.id}
                          onChange={() => setSelectedDesignId(pkg.id)}
                          className="sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedDesignId === pkg.id ? 'border-[#c5a059]' : 'border-gray-500'
                            }`}
                        >
                          {selectedDesignId === pkg.id && (
                            <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                          )}
                        </span>
                        {pkg.houseArea || getLabel(pkg.serviceType, isZh)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Design Pricing Card */}
                {currentDesign && (
                  <div className="max-w-4xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden transition-all duration-500">
                      {/* Fee Header */}
                      <div className="bg-gradient-to-r from-[#c5a059]/20 to-transparent px-10 py-8 border-b border-white/5">
                        <p className="text-sm uppercase tracking-widest text-[#c5a059]/70 mb-2">
                          {isZh ? '项目启动费' : 'Project Initiation Fee'}
                        </p>
                        <p className="text-5xl font-sans font-bold text-white">
                          {currentDesign.fee}
                        </p>
                      </div>

                      {/* Service Items */}
                      <div className="px-10 py-8">
                        <p className="text-sm uppercase tracking-widest text-gray-500 mb-5">
                          {isZh ? '服务项目' : 'Service Items'}
                        </p>
                        <ul className="space-y-4">
                          {parseItems(currentDesign.serviceItems, isZh).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                              <svg
                                className="w-6 h-6 text-[#c5a059] flex-shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-base">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Buy Now */}
                      <div className="px-10 pb-8">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => submitOrder('design')}
                          className="block w-full text-center py-3.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#f1e0ac] text-black font-semibold text-base tracking-wide cursor-pointer
                            hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                        >
                          {submitting ? (isZh ? '提交中...' : 'Submitting...') : (isZh ? '立即购买' : 'Buy Now')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════ PROCUREMENT TAB ═══════════ */}
        {activeTab === 'procurement' && (
          <div data-aos="fade-up">
            {procurementPkgs.length === 0 ? (
              <p className="text-center text-gray-500 py-10">{isZh ? '暂无服务' : 'No services available'}</p>
            ) : (
              <>
                {/* Package Selection */}
                <div className="mb-10">
                  <h3 className="text-base uppercase tracking-widest text-[#c5a059] mb-5 text-center">
                    {isZh ? '选择套餐' : 'Select Package'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {procurementPkgs.map((pkg) => (
                      <label
                        key={pkg.id}
                        className={`
                          relative flex items-center gap-2.5 px-6 py-3 rounded-full cursor-pointer
                          border transition-all duration-300 text-base
                          ${selectedProcurementId === pkg.id
                            ? 'border-[#c5a059] bg-[#c5a059]/10 text-white shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                            : 'border-white/10 bg-[#141414] text-gray-400 hover:border-white/30 hover:text-white'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="procurementPlan"
                          value={pkg.id}
                          checked={selectedProcurementId === pkg.id}
                          onChange={() => setSelectedProcurementId(pkg.id)}
                          className="sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedProcurementId === pkg.id ? 'border-[#c5a059]' : 'border-gray-500'
                            }`}
                        >
                          {selectedProcurementId === pkg.id && (
                            <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                          )}
                        </span>
                        {getLabel(pkg.serviceType, isZh)} — {isZh ? getFeeZh(pkg.fee) : pkg.fee}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Procurement Pricing Card */}

                {currentProcurement && (
                  <div className="max-w-4xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden transition-all duration-500">
                      {/* Fee Header */}
                      <div className="bg-gradient-to-r from-[#c5a059]/20 to-transparent px-10 py-8 border-b border-white/5">
                        <p className="text-sm uppercase tracking-widest text-[#c5a059]/70 mb-2">
                          {isZh ? '每日费用' : 'Daily Rate'}
                        </p>
                        <p className="text-5xl font-sans font-bold text-white">
                          {isZh ? getFeeZh(currentProcurement.fee) : currentProcurement.fee}
                        </p>
                      </div>

                      {/* Service Items */}
                      <div className="px-10 py-8">
                        <p className="text-sm uppercase tracking-widest text-gray-500 mb-5">
                          {isZh ? '服务项目' : 'Service Items'}
                        </p>
                        <ul className="space-y-4">
                          {parseItems(currentProcurement.serviceItems, isZh).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                              <svg
                                className="w-6 h-6 text-[#c5a059] flex-shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-base">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Travel Date Selector */}
                      <div className="px-10 pb-5">
                        <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">
                          {isZh ? '出行日期' : 'Travel Date'}
                        </p>
                        <CalendarPicker
                          value={selectedDate[currentProcurement.id] || ''}
                          onChange={(date) => {
                            setDateError(false)
                            setSelectedDate((prev) => ({ ...prev, [currentProcurement.id]: date }))
                          }}
                          isZh={isZh}
                          hasError={dateError}
                        />
                        {dateError && (
                          <p className="text-red-400 text-sm mt-2">
                            {isZh ? '请先选择出行日期' : 'Please select a travel date before purchasing'}
                          </p>
                        )}
                      </div>

                      {/* Buy Now */}
                      <div className="px-10 pb-8 pt-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            if (!selectedDate[currentProcurement.id]) {
                              setDateError(true)
                              return
                            }
                            submitOrder('procurement')
                          }}
                          className="block w-full text-center py-3.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#f1e0ac] text-black font-semibold text-base tracking-wide cursor-pointer
                            hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                        >
                          {submitting ? (isZh ? '提交中...' : 'Submitting...') : (isZh ? '立即购买' : 'Buy Now')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

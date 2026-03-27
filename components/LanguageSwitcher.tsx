'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { Locale } from '@/lib/i18n'

const options: Array<{ value: Locale; label: string; short: string }> = [
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'zh', label: '中文', short: '中文' },
]

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()

    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5 backdrop-blur tracking-normal normal-case h-9 min-w-[108px] justify-center">
            {options.map((opt) => {
                const active = locale === opt.value
                const textClass = opt.value === 'en'
                    ? 'uppercase tracking-[0.22em] whitespace-nowrap'
                    : 'normal-case tracking-[0.02em] whitespace-nowrap'
                return (
                    <button
                        key={opt.value}
                        onClick={() => setLocale(opt.value)}
                        className={`h-7 min-w-[44px] px-3 rounded-full text-[12px] leading-none font-medium transition ${textClass} ${
                            active
                                ? 'bg-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.35)]'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        aria-label={opt.label}
                    >
                        {opt.short}
                    </button>
                )
            })}
        </div>
    )
}

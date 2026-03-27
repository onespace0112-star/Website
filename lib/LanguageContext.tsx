'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale, getTranslation } from './i18n'

type TranslationType = ReturnType<typeof getTranslation>

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: TranslationType
}

// Provide default values to avoid undefined context during hydration
const defaultContextValue: LanguageContextType = {
    locale: defaultLocale,
    setLocale: () => { },
    t: getTranslation(defaultLocale),
}

const LanguageContext = createContext<LanguageContextType>(defaultContextValue)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Read from localStorage on mount
        const saved = localStorage.getItem('locale') as Locale | null
        if (saved && (saved === 'zh' || saved === 'en')) {
            setLocaleState(saved)
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale
        document.documentElement.dir = 'ltr'
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('locale', newLocale)
        // Update html lang attribute
        document.documentElement.lang = newLocale === 'zh' ? 'zh-Hans' : newLocale
        document.documentElement.dir = 'ltr'
    }

    const t = getTranslation(locale)

    // Always provide context, but use default locale before mount to avoid hydration mismatch
    const value: LanguageContextType = mounted
        ? { locale, setLocale, t }
        : defaultContextValue

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    return useContext(LanguageContext)
}

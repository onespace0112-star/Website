'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()

const protectedTerms = [
    'ONE SPACE',
    'ONE SPACE CN',
    'ONESPACE',
]

const protectInline = (text: string) => {
    const tokens: Record<string, string> = {}
    let index = 0
    let result = text
    for (const term of protectedTerms) {
        if (!term) continue
        const token = `__PROTECT_${index}__`
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        if (regex.test(result)) {
            tokens[token] = term
            result = result.replace(regex, token)
            index += 1
        }
    }
    return { text: result, tokens }
}

const restoreInline = (text: string, tokens: Record<string, string>) => {
    let result = text
    for (const [token, value] of Object.entries(tokens)) {
        result = result.replace(new RegExp(token, 'g'), value)
    }
    return result
}

export function useZhRuntimeTranslator(
    locale: string,
    baseMap: Record<string, string> = {}
) {
    const [runtimeMap, setRuntimeMap] = useState<Record<string, string>>({})
    const requestedRef = useRef<Set<string>>(new Set())

    const mergedMap = useMemo(() => {
        const map: Record<string, string> = {}
        if (locale === 'zh') {
            for (const [k, v] of Object.entries(baseMap || {})) {
                map[normalize(String(k))] = String(v)
            }
        }
        for (const [k, v] of Object.entries(runtimeMap)) {
            map[normalize(String(k))] = String(v)
        }
        return map
    }, [baseMap, runtimeMap, locale])

    const translate = useCallback(
        (text?: string | null) => {
            if (!text) return text || ''
            if (locale === 'en') return text
            const key = normalize(text)
            const mapped = mergedMap[key]
            if (!mapped) return text
            const { tokens } = protectInline(text)
            return restoreInline(mapped, tokens)
        },
        [locale, mergedMap]
    )

    const preload = useCallback(
        async (
            texts: Array<string | null | undefined>,
            options?: { force?: boolean }
        ) => {
            if (locale === 'en') return

            const candidates = texts
                .map((text) => (typeof text === 'string' ? normalize(text) : ''))
                .filter(Boolean)
                .filter((text) => !mergedMap[text] && !requestedRef.current.has(text))

            const uniqueMissing = Array.from(new Set(candidates))
            if (uniqueMissing.length === 0) return

            uniqueMissing.forEach((item) => requestedRef.current.add(item))

            try {
                const protectedPayload = uniqueMissing.map((text) => {
                    const { text: protectedText } = protectInline(text)
                    return protectedText
                })
                const res = await fetch('/api/i18n/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ locale, texts: protectedPayload, force: options?.force }),
                })

                if (!res.ok) return
                const data = await res.json()
                const translated = (data?.translations || {}) as Record<string, string>
                if (Object.keys(translated).length > 0) {
                    const restored: Record<string, string> = {}
                    for (const original of uniqueMissing) {
                        const { text: protectedText, tokens } = protectInline(original)
                        const value = translated[protectedText]
                        if (value) restored[normalize(original)] = restoreInline(value, tokens)
                    }
                    if (Object.keys(restored).length > 0) {
                        setRuntimeMap((prev) => ({ ...prev, ...restored }))
                    }
                }
            } catch {
                // keep silent to avoid noisy UX
            }
        },
        [locale, mergedMap]
    )

    return { translate, preload }
}

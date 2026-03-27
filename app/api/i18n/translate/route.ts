import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { translations } from '@/lib/i18n'

type TranslateRequest = {
    locale?: string
    texts?: string[]
    force?: boolean
}

const aiConfigPath = join(process.cwd(), 'config', 'ai.json')
const cachePath = (locale: string) =>
    join(process.cwd(), 'config', `translation-cache-${locale}.json`)

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()

function getGeminiKey() {
    if (existsSync(aiConfigPath)) {
        try {
            const config = JSON.parse(readFileSync(aiConfigPath, 'utf-8'))
            if (config?.geminiApiKey) return String(config.geminiApiKey).trim()
        } catch {
            // ignore config parsing errors and fallback to env
        }
    }
    return String(process.env.GEMINI_API_KEY || '').trim()
}

function getStaticMap(locale: string) {
    const lang = (translations as any)[locale] || {}
    const sources = [lang.projectMap || {}, lang.teamMap || {}]
    const map: Record<string, string> = {}
    for (const src of sources) {
        for (const [k, v] of Object.entries(src)) {
            map[normalize(String(k))] = String(v)
        }
    }
    return map
}

function readCache(locale: string) {
    const path = cachePath(locale)
    if (!existsSync(path)) return {}
    try {
        const raw = JSON.parse(readFileSync(path, 'utf-8'))
        const map: Record<string, string> = {}
        for (const [k, v] of Object.entries(raw || {})) {
            map[normalize(String(k))] = String(v)
        }
        return map
    } catch {
        return {}
    }
}

function writeCache(locale: string, cache: Record<string, string>) {
    writeFileSync(cachePath(locale), JSON.stringify(cache, null, 2))
}

const protectedTerms = [
    'ONE SPACE',
    'ONE SPACE CN',
    'ONESPACE',
]

function buildProtectedSet() {
    const en = (translations as any).en || {}
    const projectMap = en.projectMap || {}
    const keys = Object.keys(projectMap)
    return new Set(keys.map((k) => normalize(k)))
}

const protectedSet = buildProtectedSet()

function shouldSkipTranslation(text: string) {
    const key = normalize(text)
    if (protectedSet.has(key)) return true
    if (protectedTerms.some((term) => key.includes(normalize(term)))) return true
    // Only skip single-word proper nouns that look like person first/last names
    // Do NOT skip multi-word phrases that could be project titles or location descriptions
    const singleWordName = /^[A-Z][a-z'.-]+$/.test(text)
    const blocked = /(Manager|Director|Project|Installation|Service|Support|Team)/i.test(text)
    return singleWordName && !blocked
}

function protectInline(text: string) {
    const tokens: Record<string, string> = {}
    let result = text
    let index = 0
    for (const term of protectedTerms) {
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

function restoreInline(text: string, tokens: Record<string, string>) {
    let result = text
    for (const [token, value] of Object.entries(tokens)) {
        result = result.replace(new RegExp(token, 'g'), value)
    }
    return result
}

async function translateMissingWithGemini(texts: string[], locale: string) {
    const apiKey = getGeminiKey()
    if (!apiKey || texts.length === 0) return {}

    const language =
        locale === 'fr' ? 'French'
            : locale === 'th' ? 'Thai'
                : 'Simplified Chinese'
    const prompt = `Translate each English text to ${language}.\nRules:\n1) Keep protected tokens (e.g. __PROTECT_0__) exactly as-is.\n2) Keep brand names as-is (e.g. ONE SPACE).\n3) Keep numbers/units accurate.\n4) Return ONLY valid JSON object: {"original":"translated"}.\n\nTexts:\n${JSON.stringify(texts)}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1beta' })
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return {}

    try {
        const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1))
        const map: Record<string, string> = {}
        for (const [k, v] of Object.entries(parsed || {})) {
            const key = normalize(String(k))
            const value = String(v).trim()
            if (key && value) map[key] = value
        }
        return map
    } catch {
        return {}
    }
}

async function translateMissingWithGoogle(texts: string[], locale: string) {
    if (texts.length === 0) return {}
    const target = locale === 'fr' ? 'fr' : locale === 'th' ? 'th' : 'zh-CN'
    const map: Record<string, string> = {}
    for (const text of texts) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`
            const res = await fetch(url)
            if (!res.ok) continue
            const data = await res.json()
            const translated = Array.isArray(data?.[0])
                ? data[0].map((part: any) => part?.[0]).filter(Boolean).join('')
                : ''
            if (translated) {
                map[normalize(text)] = String(translated).trim()
            }
        } catch {
            // ignore single translation errors
        }
    }
    return map
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as TranslateRequest
        const locale = body.locale || 'en'
        const inputTexts = Array.isArray(body.texts) ? body.texts : []
        const forceTranslate = Boolean(body.force)

        if (locale !== 'zh' || inputTexts.length === 0) {
            return NextResponse.json({ translations: {} })
        }

        const uniqueTexts = Array.from(
            new Set(
                inputTexts
                    .map((text) => (typeof text === 'string' ? normalize(text) : ''))
                    .filter(Boolean)
            )
        )

        const staticMap = locale === 'zh' ? getStaticMap(locale) : {}
        const cache = readCache(locale)
        const result: Record<string, string> = {}
        const missing: string[] = []

        for (const text of uniqueTexts) {
            if (staticMap[text]) { result[text] = staticMap[text]; continue }
            if (cache[text]) { result[text] = cache[text]; continue }
            if (!forceTranslate && shouldSkipTranslation(text)) {
                result[text] = text
                continue
            }
            missing.push(text)
        }

        if (missing.length > 0) {
            const protectedMissing = missing.map((text) => {
                const { text: protectedText } = protectInline(text)
                return protectedText
            })
            let translated = await translateMissingWithGemini(protectedMissing, locale)
            if (Object.keys(translated).length === 0) {
                translated = await translateMissingWithGoogle(protectedMissing, locale)
            }
            for (const text of missing) {
                const { text: protectedText, tokens } = protectInline(text)
                if (translated[protectedText]) {
                    const restored = restoreInline(translated[protectedText], tokens)
                    result[text] = restored
                    cache[text] = restored
                }
            }
            if (Object.keys(translated).length > 0) {
                writeCache(locale, cache)
            }
        }

        return NextResponse.json({ translations: result })
    } catch (error) {
        return NextResponse.json({ translations: {} }, { status: 200 })
    }
}

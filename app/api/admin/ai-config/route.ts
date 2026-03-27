import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/userAuth'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const configPath = join(process.cwd(), 'config', 'ai.json')

const DEFAULT_MODELS: Record<string, string> = {
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4o-mini',
}

function getConfig() {
    if (!existsSync(configPath)) {
        return { apiKey: '', geminiApiKey: '', provider: 'gemini', model: DEFAULT_MODELS.gemini, systemPrompt: '' }
    }
    try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        const provider = config.provider || 'gemini'
        const model = config.model || DEFAULT_MODELS[provider] || DEFAULT_MODELS.gemini
        const apiKey = config.apiKey || config.geminiApiKey || ''
        return {
            apiKey,
            geminiApiKey: config.geminiApiKey || '',
            provider,
            model,
            systemPrompt: config.systemPrompt || ''
        };
    } catch {
        return { apiKey: '', geminiApiKey: '', provider: 'gemini', model: DEFAULT_MODELS.gemini, systemPrompt: '' }
    }
}

function saveConfig(config: { apiKey: string; provider: string; model: string; systemPrompt: string; geminiApiKey?: string }) {
    const dir = join(process.cwd(), 'config')
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2))
}

// GET - Get AI config (masked)
export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const config = getConfig()
    // Mask API key for security
    const maskedKey = config.apiKey
        ? config.apiKey.slice(0, 8) + '...' + config.apiKey.slice(-4)
        : ''

    return NextResponse.json({
        apiKey: maskedKey,
        hasKey: !!config.apiKey,
        provider: config.provider || 'gemini',
        model: config.model || DEFAULT_MODELS.gemini,
        systemPrompt: config.systemPrompt || '',
    })
}

// POST - Update AI config
export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { apiKey, provider, model, systemPrompt } = body

    const currentConfig = getConfig()

    const normalizedProvider = provider || currentConfig.provider || 'gemini'
    const normalizedModel = model || currentConfig.model || DEFAULT_MODELS[normalizedProvider] || DEFAULT_MODELS.gemini
    const nextApiKey = apiKey || currentConfig.apiKey || currentConfig.geminiApiKey || ''

    const newConfig = {
        apiKey: nextApiKey,
        geminiApiKey: normalizedProvider === 'gemini' ? nextApiKey : currentConfig.geminiApiKey,
        provider: normalizedProvider,
        model: normalizedModel,
        systemPrompt: systemPrompt !== undefined ? systemPrompt : currentConfig.systemPrompt,
    }

    saveConfig(newConfig)

    // Also update environment variable for current session
    if (nextApiKey) {
        if (normalizedProvider === 'gemini') {
            process.env.GEMINI_API_KEY = nextApiKey
        }
        if (normalizedProvider === 'openai') {
            process.env.OPENAI_API_KEY = nextApiKey
        }
    }

    try {
        const { createLog } = await import('@/lib/logger')
        await createLog('修改AI配置', 'AI配置已更新')
    } catch (e) {
        console.error('Log error', e)
    }

    return NextResponse.json({ success: true })
}

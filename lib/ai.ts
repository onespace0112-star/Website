import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from './prisma'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

type AIProvider = 'gemini' | 'openai'

type AIConfig = {
    apiKey: string
    provider: AIProvider
    model: string
    systemPrompt: string
}

type KnowledgeItem = {
    id: number
    title: string
    content: string
    category?: string | null
    tags?: string | null
    priority: number
}

type AIResponse = {
    text: string
    needsKnowledge: boolean
    sources: { id: number; title: string }[]
}

// Function to get AI config dynamically
function getAIConfig(): AIConfig {
    const configPath = join(process.cwd(), 'config', 'ai.json')
    if (existsSync(configPath)) {
        try {
            const config = JSON.parse(readFileSync(configPath, 'utf-8'));
            const provider = (config.provider || 'gemini') as AIProvider
            const model = config.model || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash')
            const apiKey = (config.apiKey || config.geminiApiKey || '').trim()
            return {
                apiKey,
                provider,
                model,
                systemPrompt: config.systemPrompt || ''
            }
        } catch (e) {
            console.error('Error reading AI config:', e)
        }
    }
    return {
        apiKey: (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '').trim(),
        provider: (process.env.OPENAI_API_KEY ? 'openai' : 'gemini'),
        model: process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'gemini-2.0-flash',
        systemPrompt: ''
    }
}

function detectLanguage(text: string): 'zh' | 'en' {
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
    return 'en'
}

function tokenize(text: string): string[] {
    const normalized = text.toLowerCase()
    const tokens = normalized.split(/[\s,.;:!?()，。；：！？、]+/).filter(t => t.length >= 2)
    const chineseChunks = normalized.match(/[\u4e00-\u9fff]+/g) || []
    for (const chunk of chineseChunks) {
        if (chunk.length >= 2) {
            for (let i = 0; i < chunk.length - 1; i++) {
                tokens.push(chunk.slice(i, i + 2))
            }
        }
    }
    return Array.from(new Set(tokens))
}

function scoreField(field: string, tokens: string[], weight: number): number {
    let score = 0
    for (const token of tokens) {
        if (field.includes(token)) {
            score += weight
        }
    }
    return score
}

async function selectKnowledgeItems(message: string, limit = 4): Promise<KnowledgeItem[]> {
    const items = await prisma.knowledgeBase.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        select: { id: true, title: true, content: true, category: true, tags: true, priority: true },
    })

    const teamMembers = await prisma.teamMember.findMany({
        orderBy: { order: 'asc' },
        select: { id: true, name: true, position: true, responsibilities: true, skills: true, workingYears: true },
    })

    const teamItems: KnowledgeItem[] = teamMembers.map((member) => ({
        id: 100000 + member.id,
        title: `Team Member: ${member.name}`,
        content: `Name: ${member.name}\nPosition: ${member.position || ''}\nResponsibilities: ${member.responsibilities || ''}\nSkills: ${member.skills || ''}\nWorking Years: ${member.workingYears || ''}`,
        category: 'team',
        tags: `team,member,${member.name},${member.position || ''}`,
        priority: 5,
    }))

    const combined = items.concat(teamItems)
    if (combined.length === 0) return []

    const tokens = tokenize(message)
    const raw = message.toLowerCase()
    const scored = combined.map(item => {
        const title = item.title.toLowerCase()
        const content = item.content.toLowerCase()
        const category = (item.category || '').toLowerCase()
        const tags = (item.tags || '').toLowerCase()
        let score = item.priority || 0
        score += scoreField(title, tokens, 4)
        score += scoreField(category, tokens, 3)
        score += scoreField(tags, tokens, 3)
        score += scoreField(content, tokens, 1)
        if (raw && (title.includes(raw) || content.includes(raw))) score += 2
        return { item, score }
    })

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.item)
}

function buildKnowledgeContent(items: KnowledgeItem[]): string {
    if (items.length === 0) return ''
    return items.map((item) => {
        const meta: string[] = []
        if (item.category) meta.push(`Category: ${item.category}`)
        if (item.tags) meta.push(`Tags: ${item.tags}`)
        return `## ${item.title}\n${meta.length ? meta.join(' | ') + '\n' : ''}${item.content}`
    }).join('\n\n')
}

// Build system prompt
function buildSystemPrompt(knowledgeContent: string, customPrompt: string | undefined, language: 'zh' | 'en'): string {
    const defaultPrompt = `You are ONE SPACE's intelligent customer service assistant and a proactive delivery consultant.

ONE SPACE is a service team focusing on high-end residential one-stop delivery. Services include:
- Design Coordination
- Sourcing & Procurement
- QC Evidence Chain
- Logistics & Delivery
- Installation Readiness
- Project Control

Service Regions: UAE, Europe (Spain, France, Italy), Australia, Asia (Singapore, Hong Kong).

You are familiar with ONE SPACE website content, including Services, Process, Cases, Team, FAQ, Knowledge Base, and Contact information.
When the user asks about internal team members (e.g., CEO/Founder), answer based on the Team data.

Here is the knowledge base content, please answer user questions based on this information:

${knowledgeContent}

Response Requirements:
1. Answer in a professional but friendly tone.
2. Be proactive: ask 1–2 short follow-up questions that help move the project forward (location, scope, budget, timeline, drawings).
3. If the question is outside the scope of knowledge, politely guide the user to contact us via WhatsApp (+86 18126679031).
4. Keep answers concise and clear (no long lists unless asked).
5. Reply in the user's language. If the user's language is unclear, default to English.`

    const languageHint = language === 'zh'
        ? '请用中文回答，语气专业友好。'
        : 'Please reply in English with a professional, friendly tone.'

    if (!customPrompt) return `${defaultPrompt}\n\n${languageHint}`;

    // If custom prompt exists, we can either replace or prepend knowledge
    return `${customPrompt}\n\n${languageHint}\n\nHere is knowledge base content for reference:\n\n${knowledgeContent}`;
}

// Chat with Gemini
export async function chatWithAI(
    userMessage: string,
    chatHistory: { role: string; content: string }[] = []
): Promise<AIResponse> {
    const config = getAIConfig()
    const apiKey = (config.apiKey || '').trim()
    const language = detectLanguage(userMessage)

    if (!apiKey) {
        return {
            text: language === 'zh'
                ? '抱歉，AI 服务暂时不可用。请通过 WhatsApp 联系我们：+86 18126679031'
                : 'Sorry, AI service is temporarily unavailable. Please contact us via WhatsApp: +86 18126679031',
            needsKnowledge: false,
            sources: []
        }
    }

    try {
        const knowledgeItems = await selectKnowledgeItems(userMessage)
        const needsKnowledge = knowledgeItems.length === 0
        const knowledgeContent = buildKnowledgeContent(knowledgeItems)
        const systemPrompt = buildSystemPrompt(knowledgeContent, config.systemPrompt, language)

        if (config.provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...chatHistory.map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
                        { role: 'user', content: userMessage },
                    ],
                    temperature: 0.4,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error?.message || 'OpenAI API error')
            }

            const text = data?.choices?.[0]?.message?.content?.trim() || ''
            return {
                text,
                needsKnowledge,
                sources: knowledgeItems.map(item => ({ id: item.id, title: item.title })),
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Use Gemini with systemInstruction for optimal performance
        const model = genAI.getGenerativeModel({
            model: config.model || 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        }, { apiVersion: 'v1beta' })

        // Build chat history for context
        const history = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }))

        const chat = model.startChat({
            history: history,
        })

        const result = await chat.sendMessage(userMessage)
        const response = result.response
        const text = response.text()
        console.log('AI Response:', text)
        return { text, needsKnowledge, sources: knowledgeItems.map(item => ({ id: item.id, title: item.title })) }
    } catch (error: any) {
        console.error('AI Chat Error:', error.message || error)
        return {
            text: language === 'zh'
                ? '抱歉，处理消息时出现问题。请稍后重试或通过 WhatsApp 联系我们：+86 18126679031'
                : 'Sorry, there was an issue processing your message. Please try again later or contact us via WhatsApp: +86 18126679031',
            needsKnowledge: false,
            sources: []
        }
    }
}

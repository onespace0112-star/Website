import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'
import AdmZip from 'adm-zip'

function resolveFilePath(fileUrl: string) {
    try {
        const url = new URL(fileUrl, 'http://localhost')
        const pathname = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`
        const decodedPath = decodeURIComponent(pathname)
        return path.join(process.cwd(), 'public', decodedPath)
    } catch {
        return path.join(process.cwd(), 'public', fileUrl)
    }
}

function normalize(value: string) {
    return value.trim().toLowerCase()
}

function parseJson(content: string) {
    try {
        const data = JSON.parse(content)
        if (Array.isArray(data)) return data
        if (data && Array.isArray(data.items)) return data.items
        return []
    } catch {
        return []
    }
}

function parseDelimited(content: string, delimiter: string) {
    const lines = content.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return []
    const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase())
    const qIndex = header.findIndex((h) => ['question', 'q', 'title'].includes(h))
    const aIndex = header.findIndex((h) => ['answer', 'a', 'content'].includes(h))
    if (qIndex === -1 || aIndex === -1) return []
    return lines.slice(1).map((line) => {
        const cols = line.split(delimiter)
        return {
            question: cols[qIndex]?.trim() || '',
            answer: cols[aIndex]?.trim() || '',
        }
    })
}

function parseFallback(content: string) {
    const lines = content.split(/\r?\n/).filter(Boolean)
    return lines.map((line) => {
        const parts = line.split('|')
        if (parts.length >= 2) {
            return { question: parts[0].trim(), answer: parts.slice(1).join('|').trim() }
        }
        return { question: line.trim(), answer: '' }
    })
}

function parsePptx(filePath: string) {
    try {
        const zip = new AdmZip(filePath)
        const entries = zip.getEntries()
        const slideEntries = entries
            .filter((e) => e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml'))
            .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }))

        const items: Array<{ question?: string; answer?: string }> = []
        for (const entry of slideEntries) {
            const xml = entry.getData().toString('utf-8')
            const texts = Array.from(xml.matchAll(/<a:t>(.*?)<\/a:t>/g)).map((m) => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()).filter(Boolean)
            if (texts.length === 0) continue

            const lines = texts.map((l) => l.trim()).filter(Boolean)
            if (lines.length === 0) continue

            for (let i = 0; i < lines.length; i += 1) {
                const line = lines[i]
                if (/^A[:：]/i.test(line) || /^CTA[:：]?/i.test(line)) continue

                const questionCandidate = line.replace(/^\d+\.\s*/, '').trim()
                const nextLine = lines[i + 1] || ''
                const maybeAnswerLine = lines[i + 2] || ''

                let answer = ''
                if (/^A[:：]/i.test(nextLine)) {
                    answer = nextLine.replace(/^A[:：]\s*/i, '').trim()
                } else if (/^A[:：]/i.test(maybeAnswerLine)) {
                    answer = maybeAnswerLine.replace(/^A[:：]\s*/i, '').trim()
                }

                if (questionCandidate && answer) {
                    items.push({ question: questionCandidate, answer })
                }
            }
        }

        return items
    } catch {
        return []
    }
}

function searchInItems(items: Array<{ question?: string; answer?: string }>, q: string) {
    const needle = normalize(q)
    if (!needle) return null
    for (const item of items) {
        const question = item.question || ''
        const answer = item.answer || ''
        if (normalize(question).includes(needle)) {
            return { question, answer }
        }
    }
    return null
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    if (!q) {
        return NextResponse.json({ found: false })
    }

    const latest = await prisma.faqSearchFile.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!latest) {
        return NextResponse.json({ found: false })
    }

    try {
        const filePath = resolveFilePath(latest.fileUrl)
        const content = await readFile(filePath, 'utf-8')
        let items: Array<{ question?: string; answer?: string }> = []
        if (latest.fileUrl.endsWith('.json')) {
            items = parseJson(content)
        } else if (latest.fileUrl.endsWith('.csv')) {
            items = parseDelimited(content, ',')
        } else if (latest.fileUrl.endsWith('.tsv')) {
            items = parseDelimited(content, '\t')
        } else if (latest.fileUrl.endsWith('.pptx')) {
            items = parsePptx(filePath)
        } else {
            items = parseFallback(content)
        }
        const match = searchInItems(items, q)
        if (match) {
            return NextResponse.json({ found: true, ...match })
        }
        return NextResponse.json({ found: false })
    } catch (error) {
        return NextResponse.json({ found: false }, { status: 200 })
    }
}

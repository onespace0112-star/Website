'use client'

import React from 'react'

/**
 * 将 Markdown 文本渲染为精美的 HTML
 * 支持：标题、段落、粗体、斜体、链接、无序/有序列表、分割线、表格
 */
export default function MarkdownRenderer({ content }: { content: string }) {
    const html = md2html(content)
    return (
        <div
            className="legal-markdown"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineFmt(s: string): string {
    return s
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-white/10 text-[#c5a059] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#c5a059] hover:text-[#f1e0ac] underline underline-offset-2 transition-colors" target="_blank" rel="noopener">$1</a>')
        .replace(/✅/g, '<span class="text-green-400">✓</span>')
}

function md2html(md: string): string {
    const lines = md.split('\n')
    const out: string[] = []
    let inUl = false, inOl = false, inTable = false, tableHeader = false

    const closeLists = () => {
        if (inUl) { out.push('</ul>'); inUl = false }
        if (inOl) { out.push('</ol>'); inOl = false }
        if (inTable) { out.push('</tbody></table></div>'); inTable = false }
    }

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i]
        const t = raw.trim()

        // 空行
        if (!t) { closeLists(); continue }

        // 表格分隔行 |---|---|
        if (/^\|[\s\-:|]+\|$/.test(t)) {
            tableHeader = false
            continue
        }

        // 表格行
        if (t.startsWith('|') && t.endsWith('|')) {
            const cells = t.slice(1, -1).split('|').map(c => inlineFmt(c.trim()))
            if (!inTable) {
                closeLists()
                out.push('<div class="overflow-x-auto my-6 rounded-xl border border-white/10 bg-white/[0.03]"><table class="w-full text-sm border-collapse">')
                out.push('<thead><tr>')
                cells.forEach((c, ci) => out.push(`<th class="text-left px-6 py-4 ${ci === 0 ? 'w-1/2' : ''} text-[#c5a059] font-semibold border-b border-white/10 text-sm tracking-wider">${c}</th>`))
                out.push('</tr></thead><tbody>')
                inTable = true
                tableHeader = true
                continue
            }
            out.push('<tr class="border-b border-white/5 last:border-b-0">')
            cells.forEach(c => out.push(`<td class="px-6 py-3.5 text-gray-300">${c}</td>`))
            out.push('</tr>')
            continue
        }

        // Tab-separated table rows
        if (t.includes('\t')) {
            const cells = t.split(/\t+/).map(c => inlineFmt(c.trim())).filter(c => c)
            if (cells.length >= 2) {
                if (!inTable) {
                    closeLists()
                    out.push('<div class="overflow-x-auto my-6 rounded-xl border border-white/10 bg-white/[0.03]"><table class="w-full text-sm border-collapse">')
                    out.push('<thead><tr>')
                    cells.forEach((c, ci) => out.push(`<th class="text-left px-6 py-4 ${ci === 0 ? 'w-1/2' : ''} text-[#c5a059] font-semibold border-b border-white/10 text-sm tracking-wider">${c}</th>`))
                    out.push('</tr></thead><tbody>')
                    inTable = true
                    tableHeader = true
                    continue
                }
                out.push('<tr class="border-b border-white/5 last:border-b-0">')
                cells.forEach(c => out.push(`<td class="px-6 py-3.5 text-gray-300">${c}</td>`))
                out.push('</tr>')
                continue
            }
        }

        if (inTable && !t.startsWith('|') && !t.includes('\t')) {
            out.push('</tbody></table></div>')
            inTable = false
        }

        // 标题
        const hm = t.match(/^(#{1,4})\s+(.+)/)
        if (hm) {
            closeLists()
            const lvl = hm[1].length
            const text = inlineFmt(hm[2])
            if (lvl === 1) {
                out.push(`<h1 class="text-3xl md:text-4xl font-bold text-white mt-2 mb-6 pb-4 border-b border-white/10">${text}</h1>`)
            } else if (lvl === 2) {
                out.push(`<h2 class="text-xl md:text-2xl font-semibold text-white mt-10 mb-4 flex items-center gap-3"><span class="w-1 h-6 bg-gradient-to-b from-[#c5a059] to-[#f1e0ac] rounded-full inline-block"></span>${text}</h2>`)
            } else if (lvl === 3) {
                out.push(`<h3 class="text-lg font-semibold text-gray-200 mt-6 mb-3">${text}</h3>`)
            } else {
                out.push(`<h4 class="text-base font-medium text-gray-300 mt-4 mb-2">${text}</h4>`)
            }
            continue
        }

        // 分割线
        if (/^---+$/.test(t)) {
            closeLists()
            out.push('<hr class="my-8 border-white/10"/>')
            continue
        }

        // 无序列表
        const ulm = t.match(/^[-*]\s+(.+)/)
        if (ulm) {
            if (inOl) { out.push('</ol>'); inOl = false }
            if (!inUl) {
                out.push('<ul class="space-y-2 my-4 ml-1">')
                inUl = true
            }
            out.push(`<li class="flex items-start gap-3 text-gray-300"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-[#c5a059] flex-shrink-0"></span><span class="leading-relaxed">${inlineFmt(ulm[1])}</span></li>`)
            continue
        }

        // 有序列表
        const olm = t.match(/^(\d+)\.\s+(.+)/)
        if (olm) {
            if (inUl) { out.push('</ul>'); inUl = false }
            if (!inOl) {
                out.push('<ol class="space-y-2 my-4 ml-1 counter-reset-item">')
                inOl = true
            }
            out.push(`<li class="flex items-start gap-3 text-gray-300"><span class="w-6 h-6 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">${olm[1]}</span><span class="leading-relaxed">${inlineFmt(olm[2])}</span></li>`)
            continue
        }

        closeLists()
        // 普通段落
        out.push(`<p class="my-3 text-gray-300 leading-relaxed text-[15px]">${inlineFmt(t)}</p>`)
    }

    closeLists()
    return out.join('\n')
}

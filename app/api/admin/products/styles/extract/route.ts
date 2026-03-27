import { NextResponse } from 'next/server'
import path from 'path'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { extractPDFPages } from '@/lib/extractPDF'
import AdmZip from 'adm-zip'
import { mkdir, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { styleId } = await request.json()
        if (!styleId) return NextResponse.json({ error: '缺少 styleId' }, { status: 400 })

        const style = await prisma.productStyle.findUnique({ where: { id: Number(styleId) } })
        if (!style || !style.fileUrl) {
            return NextResponse.json({ error: '该风格没有上传文件' }, { status: 400 })
        }

        const filePath = path.join(process.cwd(), 'public', style.fileUrl.replace(/^\//, ''))
        const ext = path.extname(style.fileUrl).toLowerCase()
        let pages: { title: string; imageUrl: string; pageNum: number }[] = []

        if (ext === '.pdf') {
            pages = await extractPDFPages(filePath)
        } else if (ext === '.zip') {
            const zip = new AdmZip(filePath)
            const zipEntries = zip.getEntries()
            const uploadDir = path.join(process.cwd(), 'public', 'uploads')
            try { await mkdir(uploadDir, { recursive: true }) } catch (err) { }

            const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg']
            let count = 0

            for (const entry of zipEntries) {
                if (entry.isDirectory) continue
                const entryExt = path.extname(entry.entryName).toLowerCase()
                if (IMAGE_EXTS.includes(entryExt)) {
                    count++
                    const filename = `item-${Date.now()}-${randomUUID()}${entryExt}`
                    const destPath = path.join(uploadDir, filename)
                    await writeFile(destPath, entry.getData())
                    pages.push({
                        title: entry.name.replace(entryExt, ''),
                        imageUrl: `/uploads/${filename}`,
                        pageNum: count
                    })
                }
            }
        } else {
            return NextResponse.json({ error: '不支持的文件格式，仅支持 PDF 或 ZIP' }, { status: 400 })
        }

        // Delete old items first
        await prisma.productStyleItem.deleteMany({ where: { styleId: Number(styleId) } })

        // Create new items
        await prisma.productStyleItem.createMany({
            data: pages.map((p, i) => ({
                styleId: Number(styleId),
                title: p.title,
                imageUrl: p.imageUrl,
                pageNum: p.pageNum,
                sortOrder: i,
            }))
        })

        await prisma.systemLog.create({
            data: { action: '解析', content: `产品管理：解析产品风格文件 [${style.name}]，扩展名为 ${ext}，提取 ${pages.length} 个项目` }
        })

        return NextResponse.json({ ok: true, count: pages.length })
    } catch (e: any) {
        console.error('PDF extract error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

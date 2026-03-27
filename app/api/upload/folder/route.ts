import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import AdmZip from 'adm-zip'

export const maxRequestBodySize = '100mb'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg']

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: '没有获取到文件' }, { status: 400 })
        }

        const zip = new AdmZip()
        let hasImages = false

        for (const file of files) {
            const ext = path.extname(file.name).toLowerCase()
            if (IMAGE_EXTS.includes(ext)) {
                const buffer = Buffer.from(await file.arrayBuffer())
                // 使用文件原名放入 ZIP，避免重复名冲突可能需要处理，但作为源包暂时保留原名
                zip.addFile(file.name, buffer)
                hasImages = true
            }
        }

        if (!hasImages) {
            return NextResponse.json({ error: '文件夹中没有有效的图片文件' }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        try { await mkdir(uploadDir, { recursive: true }) } catch (err) { }

        const zipFilename = `folder-${Date.now()}-${randomUUID()}.zip`
        const zipPath = path.join(uploadDir, zipFilename)

        await writeFile(zipPath, zip.toBuffer())

        return NextResponse.json({
            url: `/uploads/${zipFilename}`,
            fileName: zipFilename,
            originalName: 'Folder Upload'
        })
    } catch (error) {
        console.error('Folder upload error:', error)
        return NextResponse.json({ error: '上传失败' }, { status: 500 })
    }
}

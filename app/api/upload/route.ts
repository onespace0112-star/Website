import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'

// Allow larger uploads (default is ~1‑4MB depending on runtime)
export const maxRequestBodySize = '50mb'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const execFileAsync = promisify(execFile)

const VIDEO_EXTS = ['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff']

async function compressImage(buffer: Buffer, ext: string): Promise<{ data: Buffer; ext: string }> {
    try {
        let s = sharp(buffer)
        const meta = await s.metadata()

        // 限制最大宽度 2000px，保持比例
        if (meta.width && meta.width > 2000) {
            s = s.resize(2000, undefined, { withoutEnlargement: true })
        }

        // PNG 转 WebP 压缩更高效；JPG/其他格式保持原格式压缩
        if (ext === '.png') {
            return { data: await s.webp({ quality: 80 }).toBuffer(), ext: '.webp' }
        } else if (ext === '.gif') {
            // GIF 不压缩，保留动画
            return { data: buffer, ext }
        } else {
            // JPG / WEBP / BMP / TIFF → JPEG 压缩
            return { data: await s.jpeg({ quality: 80, mozjpeg: true }).toBuffer(), ext: ext === '.webp' ? '.webp' : '.jpg' }
        }
    } catch (e) {
        console.error('Image compression failed, using original:', e)
        return { data: buffer, ext }
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: '没有获取到文件' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        let buffer = Buffer.from(bytes)

        // 部署时建议使用专门的存储服务，此处简单保存到 public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        // 确保目录存在
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (err) {
            // 目录已存在或创建失败
        }

        // 生成 URL-safe 文件名，避免特殊字符导致 404
        const originalName = file.name || 'file'
        let ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '')

        // 图片压缩
        if (IMAGE_EXTS.includes(ext)) {
            const compressed = await compressImage(buffer, ext)
            buffer = compressed.data
            ext = compressed.ext
        }

        const filename = `${Date.now()}-${randomUUID()}${ext || ''}`
        const filePath = path.join(uploadDir, filename)

        await writeFile(filePath, buffer)

        let coverUrl: string | undefined
        if (VIDEO_EXTS.includes(ext)) {
            try {
                const coverName = `${filename}.jpg`
                const coverPath = path.join(uploadDir, coverName)
                // 生成首帧封面
                await execFileAsync('ffmpeg', [
                    '-i', filePath,
                    '-frames:v', '1',
                    '-q:v', '2',
                    coverPath,
                ], { timeout: 10000 })
                coverUrl = `/uploads/${coverName}`
            } catch (err) {
                console.error('ffmpeg thumbnail failed:', err)
            }
        }

        const imageUrl = `/uploads/${filename}`
        return NextResponse.json({ url: imageUrl, coverUrl })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: '上传失败' }, { status: 500 })
    }
}

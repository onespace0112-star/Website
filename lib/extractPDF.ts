import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

export async function extractPDFPages(pdfPath: string): Promise<{ imageUrl: string; title: string; pageNum: number }[]> {
    const { pdf } = await import('pdf-to-img') as any

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const doc = await pdf(pdfPath, { scale: 1.5 })
    const results: { imageUrl: string; title: string; pageNum: number }[] = []

    let pageNum = 0
    for await (const pageBuffer of doc) {
        pageNum++
        // Compress PNG → JPEG
        const jpegBuffer = await sharp(Buffer.from(pageBuffer)).jpeg({ quality: 82 }).toBuffer()

        const filename = `style-${Date.now()}-${randomUUID()}.jpg`
        await writeFile(path.join(uploadDir, filename), jpegBuffer)

        results.push({
            imageUrl: `/uploads/${filename}`,
            title: `第 ${pageNum} 页`,
            pageNum,
        })
    }

    return results
}

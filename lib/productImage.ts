import fs from 'fs'
import path from 'path'

type ProductLike = {
    id: number
    nameEn?: string
    nameZh?: string
    image?: string
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function toPublicPath(absPath: string): string {
    const relative = absPath.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/')
    return relative.startsWith('/') ? relative : `/${relative}`
}

function fileIfExists(absPath: string): string | null {
    return fs.existsSync(absPath) ? toPublicPath(absPath) : null
}

function findTitleMatchedImage(product: ProductLike): string | null {
    const title = (product.nameEn || product.nameZh || '').trim()
    const slug = slugify(title)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')

    if (slug) {
        const bySlugPng = fileIfExists(path.join(uploadsDir, `${slug}.png`))
        if (bySlugPng) return bySlugPng
        const bySlugJpg = fileIfExists(path.join(uploadsDir, `${slug}.jpg`))
        if (bySlugJpg) return bySlugJpg
        const bySlugJpeg = fileIfExists(path.join(uploadsDir, `${slug}.jpeg`))
        if (bySlugJpeg) return bySlugJpeg
        const bySlugWebp = fileIfExists(path.join(uploadsDir, `${slug}.webp`))
        if (bySlugWebp) return bySlugWebp
    }

    const byId = fileIfExists(path.join(uploadsDir, `product_${product.id}.jpg`))
    if (byId) return byId

    return null
}

function buildTitleSeedImage(product: ProductLike): string {
    const title = (product.nameEn || product.nameZh || `product-${product.id}`).trim()
    const seed = encodeURIComponent(`${slugify(title) || 'product'}-${product.id}`)
    return `https://picsum.photos/seed/${seed}/800/600`
}

export function resolveUniqueProductImage(product: ProductLike, usedImages: Set<string>): string {
    const matchedByTitle = findTitleMatchedImage(product)
    if (matchedByTitle && !usedImages.has(matchedByTitle)) {
        usedImages.add(matchedByTitle)
        return matchedByTitle
    }

    const dbImage = (product.image || '').trim()
    if (dbImage && !usedImages.has(dbImage)) {
        usedImages.add(dbImage)
        return dbImage
    }

    const seeded = buildTitleSeedImage(product)
    usedImages.add(seeded)
    return seeded
}

import ProductClient from '@/components/ProductClient'

export const metadata = {
    title: '产品中心 Products | ONE SPACE',
    description: '精选高端家具、建材、软装产品。Explore premium furniture, building materials, and soft furnishings curated by ONE SPACE.',
    robots: { index: false, follow: false },
}

export default function ProductPage() {
    return <ProductClient />
}

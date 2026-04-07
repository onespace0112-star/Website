import ServiceClient from '@/components/ServiceClient'

export const metadata = {
    title: '服务内容 Our Services | ONE SPACE',
    description: '设计对接、采购整合、QC质检、跨境物流、安装协调 — ONE SPACE 提供高端住宅一站式交付全链条服务。Design coordination, sourcing, QC, logistics & installation.',
    keywords: ['设计对接', '采购整合', 'QC质检', '跨境物流', '安装协调', 'furniture sourcing', 'quality control', 'logistics'],
    alternates: { canonical: 'https://onespacecn.com/services' },
}

export default function ServicesPage() {
    return <ServiceClient />
}

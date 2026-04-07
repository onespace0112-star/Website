import type { Metadata } from 'next'
import ProcessClient from '@/components/ProcessClient'

export const metadata: Metadata = {
    title: '交付流程 Delivery Process | ONE SPACE',
    description: '一站式交付流程：设计确认→采购→QC验货→物流→安装。全程可视化、里程碑推进。One-stop delivery: design, sourcing, QC, logistics & installation.',
    keywords: ['交付流程', 'QC验货', '物流清关', '安装协调', 'delivery process', 'quality inspection', 'logistics'],
    alternates: { canonical: 'https://onespacecn.com/process' },
}

export default function ProcessPage() {
    return <ProcessClient />
}

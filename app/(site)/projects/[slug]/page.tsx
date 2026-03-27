import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const project = await prisma.project.findUnique({ where: { slug }, select: { title: true, description: true } })
    if (!project) return { title: 'Project | ONE SPACE' }
    return {
        title: `${project.title} | ONE SPACE`,
        description: project.description || 'Luxury project by ONE SPACE — premium furniture and home furnishing solutions.',
    }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const project = await prisma.project.findUnique({
        where: { slug }
    })

    if (!project) {
        notFound()
    }

    const safeHtml = sanitizeHtml(project.content || '')
    const projectMeta = [
        { label: '项目地点', value: project.location },
        { label: '项目面积', value: project.area },
    ].filter((item) => item.value)

    const budgetDisplay = project.budgetRange
        ? project.budgetRange
        : (project.area ? `按 ${project.area} 项目规模评估` : '按项目范围与清单评估')
    const timelineDisplay = project.timeline || '按施工节点与到货窗口协同排期'
    const deliveryResults = project.deliverables
        ? project.deliverables
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [
            '设计语言转可执行清单',
            '出货前 QC 证据链',
            '到场/安装协调与验收'
        ]
    const timelineSteps = [
        {
            title: '范围与标准确认',
            desc: '对齐设计语言、清单与交付边界，明确关键规格与预算范围。'
        },
        {
            title: '生产与QC证据链',
            desc: '生产推进与出货前QC，照片/视频留存，问题闭环后出货。'
        },
        {
            title: '装柜出运与到场协同',
            desc: '按节点排期运输，到场计划与安装条件校验，确保可落地。'
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="sticky top-0 border-b bg-white/90 backdrop-blur-sm z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="font-black">ONE SPACE</Link>
                    <div className="flex gap-3">
                        <Link href="/projects" className="text-sm text-gray-500 hover:text-black">所有案例</Link>
                        <a href="https://wa.me/8618126679031" target="_blank" rel="noopener" className="text-sm border rounded-full px-3 py-1.5 font-bold hover:bg-gray-100">WhatsApp</a>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Case Study</span>
                    <h1 className="text-3xl font-bold mt-2">{project.title}</h1>
                    <p className="text-gray-500 mt-2">{project.description}</p>
                    <div className="text-xs text-gray-400 mt-4">发布于 {project.createdAt.toLocaleDateString('zh-CN')}</div>
                </div>

                {projectMeta.length > 0 && (
                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {projectMeta.map((item) => (
                            <div key={item.label} className="border rounded-lg p-4 bg-gray-50">
                                <div className="text-xs uppercase tracking-wide text-gray-400">{item.label}</div>
                                <div className="text-gray-800 font-medium mt-1">{item.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-5 bg-white shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-gray-400">预算区间</div>
                        <div className="text-gray-900 font-semibold mt-2">{budgetDisplay}</div>
                    </div>
                    <div className="border rounded-xl p-5 bg-white shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-gray-400">交付周期</div>
                        <div className="text-gray-900 font-semibold mt-2">{timelineDisplay}</div>
                    </div>
                    <div className="border rounded-xl p-5 bg-white shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-gray-400">交付成果</div>
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                            {deliveryResults.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-400">Delivery Evidence Chain</div>
                    <h2 className="text-2xl font-bold mt-2">交付证据链时间线</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {timelineSteps.map((step, index) => (
                            <div key={step.title} className="relative border rounded-xl p-5 bg-gray-50 overflow-hidden">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#c5a059] to-transparent" />
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-[#c5a059] text-[#c5a059] flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="text-[11px] uppercase tracking-[0.3em] text-[#c5a059]">
                                        Evidence
                                    </div>
                                </div>
                                <div className="text-lg font-semibold mt-3 text-gray-900">{step.title}</div>
                                <p className="text-sm text-gray-600 mt-2">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="hidden md:flex items-center mt-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-[#c5a059]/50 to-transparent" />
                        <div className="text-xs text-gray-400 px-3">Milestone Verified</div>
                        <div className="h-px flex-1 bg-gradient-to-l from-[#c5a059]/50 to-transparent" />
                    </div>
                </div>

                {project.coverImage && (
                    <div className="mb-8 rounded-lg border overflow-hidden">
                        <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                )}

                <article
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />

                <div className="mt-12 pt-8 border-t">
                    <Link href="/projects" className="text-sm text-gray-500 hover:text-black">← 返回所有案例</Link>
                </div>
            </main>
        </div>
    )
}

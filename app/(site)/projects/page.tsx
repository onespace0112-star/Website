import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Projects | ONE SPACE',
    description: 'Explore ONE SPACE completed luxury villa, apartment, hotel, and commercial projects worldwide.',
}

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: { order: 'asc' },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            coverImage: true,
            location: true,
            area: true,
        },
    })

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="sticky top-0 border-b bg-white/90 backdrop-blur-sm z-50">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="font-black">ONE SPACE</Link>
                    <div className="flex gap-3">
                        <Link href="/faq" className="text-sm text-gray-500 hover:text-black">FAQ</Link>
                        <a href="https://wa.me/8618126679031" target="_blank" rel="noopener" className="text-sm border rounded-full px-3 py-1.5 font-bold hover:bg-gray-100">WhatsApp</a>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Cases</span>
                    <h1 className="text-3xl font-bold mt-2">项目案例</h1>
                    <p className="text-gray-500 mt-2">高端住宅交付案例展示</p>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">暂无案例</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project: (typeof projects)[number]) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.slug}`}
                                className="group block border rounded-xl overflow-hidden hover:shadow-lg transition"
                            >
                                {project.coverImage && (
                                    <div className="aspect-video bg-gray-100 overflow-hidden">
                                        <img
                                            src={project.coverImage}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h2 className="font-bold group-hover:text-blue-600 transition">{project.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                                    {(project.location || project.area) && (
                                        <div className="text-xs text-gray-400 mt-3 flex flex-wrap gap-2">
                                            {project.location && <span>{project.location}</span>}
                                            {project.area && <span>{project.area}</span>}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

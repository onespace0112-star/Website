'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ViewerContent() {
    const searchParams = useSearchParams()
    const fileParam = searchParams.get('file')
    const fileUrl = fileParam ? decodeURIComponent(fileParam) : ''
    const filename = fileUrl ? fileUrl.split('/').pop() || '' : ''
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const previewable = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4'].includes(ext)

    if (!fileUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                未找到文件链接
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#111] text-white">
            <header className="p-4 flex items-center justify-between bg-black/70">
                <span className="text-sm text-gray-300 truncate pr-4">文件：{filename || fileUrl}</span>
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#c5a059] text-black rounded text-sm font-semibold hover:bg-[#d9b46b] transition"
                >
                    在新标签打开
                </a>
            </header>
            {previewable ? (
                <div className="flex-1 overflow-hidden bg-black">
                    <iframe
                        key={fileUrl}
                        src={fileUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; clipboard-write"
                        title="文件预览"
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-200 px-6 text-center">
                    <div className="text-lg font-semibold">此文件类型暂不支持在线预览（.{ext || '未知'}）</div>
                    <div className="text-sm text-gray-400">请点击「在新标签打开」下载查看。</div>
                </div>
            )}
        </div>
    )
}

export default function FileViewerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>}>
            <ViewerContent />
        </Suspense>
    )
}

'use client'

import { useState, useRef, ReactNode } from 'react'

interface FileUploadProps {
    onUploadSuccess: (url: string) => void
    label?: string
    className?: string
    children?: ReactNode
}

export default function FileUpload({ onUploadSuccess, label = '上传文件', className = '', children }: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const MAX_UPLOAD_BYTES = 900 * 1024
    const HARD_LIMIT_BYTES = 10 * 1024 * 1024

    const fileFromBlob = (blob: Blob, originalName: string, type: string) => {
        const nextName = originalName.replace(/\.[^.]+$/, '') + (type === 'image/jpeg' ? '.jpg' : '.webp')
        return new File([blob], nextName, { type })
    }

    const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
        new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

    const compressImageIfNeeded = async (file: File): Promise<File> => {
        if (!file.type.startsWith('image/') || file.size <= MAX_UPLOAD_BYTES) return file

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const url = URL.createObjectURL(file)
            const el = new Image()
            el.onload = () => {
                URL.revokeObjectURL(url)
                resolve(el)
            }
            el.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('图片读取失败'))
            }
            el.src = url
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return file

        const maxEdge = 1920
        let scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
        const render = () => {
            canvas.width = Math.max(1, Math.floor(img.width * scale))
            canvas.height = Math.max(1, Math.floor(img.height * scale))
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }

        render()

        const plans: Array<{ type: string; quality?: number }> = [
            { type: 'image/webp', quality: 0.82 },
            { type: 'image/webp', quality: 0.72 },
            { type: 'image/jpeg', quality: 0.8 },
            { type: 'image/jpeg', quality: 0.68 },
            { type: 'image/jpeg', quality: 0.56 },
        ]

        for (let i = 0; i < 6; i++) {
            for (const p of plans) {
                const blob = await canvasToBlob(canvas, p.type, p.quality)
                if (blob && blob.size <= MAX_UPLOAD_BYTES) {
                    return fileFromBlob(blob, file.name, p.type)
                }
            }
            scale *= 0.85
            render()
        }

        return file
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > HARD_LIMIT_BYTES) {
            alert('图片过大，请先压缩到 10MB 以内再上传')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setUploading(true)

        try {
            let finalFile = file
            try {
                finalFile = await compressImageIfNeeded(file)
            } catch (err) {
                console.warn('Image compress failed, fallback to original file', err)
                finalFile = file
            }

            if (finalFile.size > HARD_LIMIT_BYTES) {
                alert('图片过大，请先压缩后再上传')
                return
            }

            const formData = new FormData()
            formData.append('file', finalFile)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                onUploadSuccess(data.url)
            } else {
                const contentType = res.headers.get('content-type') || ''
                let message = '上传失败'

                if (res.status === 401) {
                    message = '上传失败：请重新登录管理后台'
                } else if (contentType.includes('application/json')) {
                    const errorData = await res.json()
                    message = errorData.error || message
                } else if (res.status === 413) {
                    message = '图片过大，请压缩后再上传（建议 1MB 以内）'
                } else {
                    const text = await res.text()
                    if (text) message = `${message}（${res.status}）`
                }

                alert(message)
                console.error('Upload failed:', { status: res.status, message })
            }
        } catch (error) {
            console.error('Upload Error:', error)
            if (file.size > MAX_UPLOAD_BYTES) {
                alert('图片可能过大导致上传失败，请压缩到 1MB 以内后重试')
            } else {
                alert('上传过程中发生错误，请重试')
            }
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {children ? (
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {children}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <svg className="h-4 w-4 animate-spin text-gray-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-gray-400">处理中...</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-4 w-4 text-gray-400 transition-colors group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{label}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

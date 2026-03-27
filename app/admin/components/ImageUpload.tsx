'use client'

import React, { useRef, useState } from 'react'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                onChange(data.url)
            }
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div
            className="w-32 h-32 border border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 relative bg-white overflow-hidden"
            onClick={() => inputRef.current?.click()}
        >
            {value ? (
                <>
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                            console.error('Preview image failed to load:', value)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                        }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                        {value.split('/').pop()}
                    </div>
                </>
            ) : (
                <div className="text-gray-400 text-center">
                    <span className="text-2xl block">+</span>
                    <span className="text-xs">上传</span>
                </div>
            )}

            {uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs">
                    上传中...
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                }}
            />
        </div>
    )
}

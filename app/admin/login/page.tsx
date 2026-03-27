'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' }
        })

        if (res.ok) {
            setSuccess('已登录')
            // Add a small delay so user sees the message
            setTimeout(() => {
                router.push('/admin') // Redirect to dashboard
            }, 800)
        } else {
            setError('Invalid username or password')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black tracking-tight">ONE SPACE</h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Admin Dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none border"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none border"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-xs font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100 animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div className="text-xs font-medium text-green-500 bg-green-50 p-2 rounded border border-green-100 animate-pulse">
                            ✅ {success}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    )
}

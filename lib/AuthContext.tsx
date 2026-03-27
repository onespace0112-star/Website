'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface User {
    id: number
    name: string
    email?: string
    phone?: string
    // add other fields if needed
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (userData: User) => void
    logout: () => void
    refreshUser: () => Promise<void>
    requireAuth: (action?: () => void) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    // We don't read searchParams here directly as it might not be available in all contexts,
    // but checkAuth logic is independent.

    const refreshUser = async () => {
        try {
            const res = await fetch('/api/user/me')
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Failed to fetch user', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [pathname])

    const login = (userData: User) => {
        setUser(userData)
    }

    const logout = async () => {
        try {
            await fetch('/api/user/logout', { method: 'POST' })
            setUser(null)
            router.push('/')
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    const requireAuth = (action?: () => void) => {
        if (loading) return // Wait for loading?

        if (!user) {
            // Not logged in, redirect to login with callback
            const currentPath = window.location.pathname + window.location.search
            const encodedPath = encodeURIComponent(currentPath)
            router.push(`/login?callbackUrl=${encodedPath}`)
        } else {
            // Logged in, execute action
            if (action) action()
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, requireAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

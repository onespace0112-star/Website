import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'one-space-secret-key-2024'
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET

export interface UserPayload {
    id: number
    email?: string | null
    phone?: string | null
    name: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: UserPayload): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload
    } catch {
        return null
    }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('user_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

// Clear auth cookie
export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('user_token')
}

// Get current user from cookie
export async function getCurrentUser(): Promise<UserPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    // Verify user still exists
    const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, phone: true, name: true }
    })

    return user
}

// Check if identifier (email or phone) is already taken
export async function isIdentifierTaken(email?: string, phone?: string): Promise<{ email: boolean; phone: boolean }> {
    const result = { email: false, phone: false }

    if (email) {
        const existing = await prisma.user.findUnique({ where: { email } })
        result.email = !!existing
    }

    if (phone) {
        const existing = await prisma.user.findUnique({ where: { phone } })
        result.phone = !!existing
    }

    return result
}

// Generate admin JWT token
export function generateAdminToken(): string {
    return jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '7d' })
}

// Verify admin JWT token
export function verifyAdminToken(token: string): boolean {
    try {
        const payload = jwt.verify(token, ADMIN_JWT_SECRET) as { role?: string }
        return payload?.role === 'admin'
    } catch {
        return false
    }
}

// Set admin auth cookie
export async function setAdminCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

// Clear admin auth cookie
export async function clearAdminCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')
}

// Check admin auth via signed JWT
export async function checkAdmin(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return false
    return verifyAdminToken(token)
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateAdminToken } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        // 验证标志
        let isValid = false

        // 1. 尝试使用环境变量（.env）中的备用管理员账号登入（如 onespace / onespace）
        if (
            process.env.ADMIN_USERNAME &&
            process.env.ADMIN_PASSWORD &&
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            isValid = true
        } else {
            // 2. 如果非环境变量账号，则查找数据库中的管理员（如 admin / password123）
            const admin = await prisma.admin.findUnique({
                where: { username }
            })

            if (admin) {
                // 验证该加密密码是否匹配
                isValid = await bcrypt.compare(password, admin.password)
            }
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const adminToken = generateAdminToken()
        const response = NextResponse.json({ success: true })
        const host = request.headers.get('host') || ''
        const cookieDomain = host.includes('onespacecn.com') ? '.onespacecn.com' : undefined

        response.cookies.set('admin_token', adminToken, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            domain: cookieDomain,
        })
        response.headers.set('Cache-Control', 'no-store')

        return response

    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 })
    }
}

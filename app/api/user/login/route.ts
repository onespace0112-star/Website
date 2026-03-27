import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { identifier, password } = body

        // Validate required fields
        if (!identifier || !password) {
            return NextResponse.json(
                { error: '请输入邮箱/手机号和密码' },
                { status: 400 }
            )
        }

        // Find user by email or phone
        // Find user by email or phone (including +86 auto-match for CN numbers)
        const searchConditions: any[] = [
            { email: identifier },
            { phone: identifier },
        ]

        // If identifier is 11 digits (likely CN mobile), also try matching with +86
        if (/^\d{11}$/.test(identifier)) {
            searchConditions.push({ phone: `+86${identifier}` })
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: searchConditions,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { error: '密码错误' },
                { status: 401 }
            )
        }

        // Generate token and set cookie
        const payload = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
        }
        const token = generateToken(payload)
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            user: payload,
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
        )
    }
}

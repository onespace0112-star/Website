import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, generateToken, setAuthCookie, isIdentifierTaken } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, phone, name, password } = body

        // Validate required fields
        if (!password) {
            return NextResponse.json(
                { error: '密码是必填项' },
                { status: 400 }
            )
        }

        if (!email && !phone) {
            return NextResponse.json(
                { error: '请提供邮箱或手机号' },
                { status: 400 }
            )
        }

        // Check if identifier is taken
        const taken = await isIdentifierTaken(email, phone)
        if (taken.email) {
            return NextResponse.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            )
        }
        if (taken.phone) {
            return NextResponse.json(
                { error: '该手机号已被注册' },
                { status: 400 }
            )
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password)
        const normalizedEmail = typeof email === 'string' ? email.trim() : ''
        const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
        const derivedName = (typeof name === 'string' && name.trim())
            ? name.trim()
            : (normalizedEmail || normalizedPhone || 'Guest')

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail || null,
                phone: normalizedPhone || null,
                name: derivedName,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
            },
        })

        // Generate token and set cookie
        const token = generateToken(user)
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: '注册失败，请稍后重试' },
            { status: 500 }
        )
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { target, type } = body

        if (!target || !type) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        // Rate limit: no resend within 60 seconds for same target
        const recent = await prisma.verificationCode.findFirst({
            where: {
                target,
                createdAt: { gte: new Date(Date.now() - 60 * 1000) },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (recent) {
            return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
        }

        // Check if user exists
        const user = await prisma.user.findFirst({
            where: type === 'email'
                ? { email: target }
                : { OR: [{ phone: target }, ...((/^\+?\d{11,}$/.test(target)) ? [{ phone: `+86${target.replace(/^\+86/, '')}` }] : [])] },
        })

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        // Generate 6-digit code
        const code = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.verificationCode.create({
            data: { target, code, expiresAt },
        })

        // DEV: Log code to console (replace with email/SMS service in production)
        console.log(`[验证码] target=${target}, code=${code}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Send code error:', error)
        return NextResponse.json({ error: '发送失败，请稍后重试' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { target, code, newPassword } = body

        if (!target || !code || !newPassword) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: '密码长度至少为 6 位' }, { status: 400 })
        }

        // Verify code
        const record = await prisma.verificationCode.findFirst({
            where: {
                target,
                code,
                used: false,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!record) {
            return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 })
        }

        // Find user by email or phone
        const isEmail = target.includes('@')
        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: target }
                : { OR: [{ phone: target }, ...((/^\+?\d{11,}$/.test(target)) ? [{ phone: `+86${target.replace(/^\+86/, '')}` }] : [])] },
        })

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        // Update password
        const hashedPassword = await hashPassword(newPassword)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        })

        // Mark code as used
        await prisma.verificationCode.update({
            where: { id: record.id },
            data: { used: true },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: '重置失败，请稍后重试' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'
import { normalizePhone, validateEmail, validatePhone } from '@/lib/validation'

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, contact, intent, message, keywords } = body

    if (!contact || typeof contact !== 'string' || contact.trim().length < 3) {
        return NextResponse.json({ error: '请填写联系方式' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
        data: {
            userId: user.id,
            name: name?.trim() || user.name,
            contact: contact.trim(),
            intent: intent?.trim() || null,
            message: message?.trim() || null,
            keywords: keywords?.trim() || null,
            source: 'chat',
        }
    })

    const cleanedContact = contact.trim()
    const normalizedPhone = normalizePhone(cleanedContact)
    const isEmail = validateEmail(cleanedContact)
    const isPhone = validatePhone(normalizedPhone)

    if (isEmail || isPhone) {
        await prisma.inquiry.create({
            data: {
                name: name?.trim() || user.name,
                email: isEmail ? cleanedContact : '',
                phone: isPhone ? normalizedPhone : '',
                country: '',
                projectType: intent?.trim() || 'Chat Lead',
                description: message?.trim() || '',
                contactMethod: 'Chat',
            }
        })
    }

    return NextResponse.json({ success: true, lead })
}

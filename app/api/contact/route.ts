
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import { normalizePhone, validateEmail, validatePhone } from '@/lib/validation'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('[Contact API] Received request data:', JSON.stringify(body, null, 2))
        const {
            name, email, phone, country, source, description,
            projectType, propertyType, expectedTimeline, surfaceArea,
            budgetRange, floorPlanStatus, role, contactMethod, contactTime, images
        } = body

        const cleanedEmail = typeof email === 'string' ? email.trim() : ''
        const cleanedPhone = typeof phone === 'string' ? normalizePhone(phone) : ''

        const requiredFields = [
            name,
            cleanedEmail,
            cleanedPhone,
            country,
            projectType,
            propertyType,
            expectedTimeline,
            surfaceArea,
            budgetRange,
            floorPlanStatus,
            role,
            contactMethod,
            contactTime
        ]

        // Detailed validation with field names for debugging
        const fieldNames = [
            'name', 'email', 'phone', 'country', 'projectType', 'propertyType',
            'expectedTimeline', 'surfaceArea', 'budgetRange', 'floorPlanStatus',
            'role', 'contactMethod', 'contactTime'
        ]
        const missingFields: string[] = []
        requiredFields.forEach((field, index) => {
            if (!field || (typeof field === 'string' && field.trim() === '')) {
                missingFields.push(fieldNames[index])
            }
        })

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields)
            console.log('Received data:', { name, email, phone, country, projectType, propertyType, expectedTimeline, surfaceArea, budgetRange, floorPlanStatus, role, contactMethod, contactTime })
            return NextResponse.json({
                error: '请先填写所有必填项后再提交',
                missingFields
            }, { status: 400 })
        }
        if (!validateEmail(cleanedEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }
        if (!validatePhone(cleanedPhone)) {
            return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
        }

        const inquiry = await prisma.inquiry.create({
            data: {
                name,
                email: cleanedEmail,
                phone: cleanedPhone,
                country: country || '',
                source: (typeof source === 'string' && source.trim()) ? source.trim() : 'Direct',
                projectType: projectType || null,
                propertyType: propertyType || null,
                expectedTimeline: expectedTimeline || null,
                surfaceArea: surfaceArea || null,
                budgetRange: budgetRange || null,
                floorPlanStatus: floorPlanStatus || null,
                role: role || null,
                contactMethod: contactMethod || null,
                contactTime: contactTime || null,
                images: images || null,
                description: description || '',
            }
        })

        try {
            await (prisma as any).systemLog.create({
                data: {
                    action: '新增咨询',
                    content: `收到新的客户咨询: ${name} (${email}) - ${projectType || 'General'}`
                }
            });
        } catch (logErr) {
            console.error('SystemLog Create Error:', logErr);
        }
        return NextResponse.json(inquiry)
    } catch (error) {
        console.error('Inquiry submission error:', error)
        // Return detailed error for debugging purposes
        return NextResponse.json({
            error: 'Failed to submit inquiry',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

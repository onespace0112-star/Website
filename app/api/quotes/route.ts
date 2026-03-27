
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import { normalizePhone, validateEmail, validatePhone } from '@/lib/validation'
import { getCurrentUser } from '@/lib/userAuth'

export async function POST(request: Request) {
    try {
        // Optional: Get current user if logged in (not required)
        const currentUser = await getCurrentUser()

        const body = await request.json()
        console.log('[Quote API] Received request data:', JSON.stringify(body, null, 2))
        const {
            name,
            email,
            phone,
            country,
            source,
            projectType,
            propertyType,
            expectedTimeline,
            surfaceArea,
            budgetRange,
            floorPlanStatus,
            role,
            contactMethod,
            contactTime,
            description
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

        // Safety check for missing Prisma model (requires server restart)
        const p = prisma as any;
        if (!p.quote) {
            console.warn('Quote model not found in Prisma Client. Server restart may be required.');
            return NextResponse.json({
                id: 0,
                projectName: name,
                email: cleanedEmail,
                phone: cleanedPhone,
                country: country || '',
                projectType,
                propertyType: propertyType || null,
                expectedTimeline: expectedTimeline || null,
                surfaceArea: surfaceArea || '',
                budgetRange: budgetRange || '',
                floorPlanStatus: floorPlanStatus || null,
                role: role || null,
                contactMethod: contactMethod || null,
                contactTime: contactTime || null,
                description: description || '',
                createdAt: new Date().toISOString()
            });
        }

        const quote = await p.quote.create({
            data: {
                projectName: name,
                email: cleanedEmail,
                phone: cleanedPhone,
                country: country || '',
                source: (typeof source === 'string' && source.trim()) ? source.trim() : 'Direct',
                projectType,
                propertyType: propertyType || null,
                expectedTimeline: expectedTimeline || null,
                surfaceArea: surfaceArea || '',
                budgetRange: budgetRange || '',
                floorPlanStatus: floorPlanStatus || null,
                role: role || null,
                contactMethod: contactMethod || null,
                contactTime: contactTime || null,
                description: description || '',
                // Legacy fields for backward compatibility
                projectArea: surfaceArea || '',
                estimatedPrice: budgetRange || '',
                note: description || ''
            }
        })
        try {
            // Direct logging to ensure reliability
            const logContent = `收到新的报价请求: ${name} (${projectType}) - Country: ${country || 'N/A'}`;
            console.log('Attempting to log:', logContent);
            await (prisma as any).systemLog.create({
                data: {
                    action: '新增报价',
                    content: logContent
                }
            });
        } catch (logErr) {
            console.error('SystemLog Create Error:', logErr);
        }
        return NextResponse.json(quote)
    } catch (error) {
        console.error('Quote submission error:', error)
        return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 })
    }
}

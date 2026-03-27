import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/userAuth'

export async function POST() {
    await clearAuthCookie()
    return NextResponse.json({ success: true })
}

'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'
import { faqTypeSchema } from '@/lib/validators/faqType'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/formErrors'

export async function createFAQType(formData: FormData) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const data = {
      name: formData.get('name')
    }

    const result = faqTypeSchema.safeParse(data)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const faqType = await prisma.fAQType.create({
      data: result.data
    })

    await createLog('新增FAQ类型', `新增了FAQ类型: ${faqType.name} (ID: ${faqType.id})`)
    revalidatePath('/admin/faq/types')
    
    return successResponse(faqType)
  } catch (error) {
    console.error('FAQType create error:', error)
    return errorResponse('Failed to create FAQ type')
  }
}

export async function updateFAQType(id: number, formData: FormData) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const data = {
      name: formData.get('name')
    }

    const result = faqTypeSchema.safeParse(data)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const faqType = await prisma.fAQType.update({
      where: { id },
      data: result.data
    })

    await createLog('更新FAQ类型', `更新了FAQ类型: ${faqType.name} (ID: ${faqType.id})`)
    revalidatePath('/admin/faq/types')
    
    return successResponse(faqType)
  } catch (error) {
    console.error('FAQType update error:', error)
    return errorResponse('Failed to update FAQ type')
  }
}

export async function deleteFAQType(id: number) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const faqType = await prisma.fAQType.delete({
      where: { id }
    })

    await createLog('删除FAQ类型', `删除了FAQ类型: ${faqType.name} (ID: ${faqType.id})`)
    revalidatePath('/admin/faq/types')
    
    return successResponse({ id })
  } catch (error) {
    console.error('FAQType delete error:', error)
    return errorResponse('Failed to delete FAQ type')
  }
}

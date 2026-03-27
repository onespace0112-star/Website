'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { checkAdmin } from '@/lib/userAuth'
import { createLog } from '@/lib/logger'
import { faqSchema } from '@/lib/validators/faq'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/formErrors'

export async function createFAQ(formData: FormData) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const data = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      order: Number(formData.get('order')) || 0,
      typeId: formData.get('typeId') ? Number(formData.get('typeId')) : null,
      isActive: formData.get('isActive') === 'true'
    }

    const result = faqSchema.safeParse(data)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const faq = await prisma.fAQ.create({
      data: result.data
    })

    await createLog('新增FAQ', `新增了常见问题: ${faq.question} (ID: ${faq.id})`)
    revalidatePath('/admin/faq')
    
    return successResponse(faq)
  } catch (error) {
    console.error('FAQ create error:', error)
    return errorResponse('Failed to create FAQ')
  }
}

export async function updateFAQ(id: number, formData: FormData) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const data = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      order: Number(formData.get('order')) || 0,
      typeId: formData.get('typeId') ? Number(formData.get('typeId')) : null,
      isActive: formData.get('isActive') === 'true'
    }

    const result = faqSchema.safeParse(data)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: result.data
    })

    await createLog('更新FAQ', `更新了常见问题: ${faq.question} (ID: ${faq.id})`)
    revalidatePath('/admin/faq')
    
    return successResponse(faq)
  } catch (error) {
    console.error('FAQ update error:', error)
    return errorResponse('Failed to update FAQ')
  }
}

export async function deleteFAQ(id: number) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const faq = await prisma.fAQ.delete({
      where: { id }
    })

    await createLog('删除FAQ', `删除了常见问题: ${faq.question} (ID: ${faq.id})`)
    revalidatePath('/admin/faq')
    
    return successResponse({ id })
  } catch (error) {
    console.error('FAQ delete error:', error)
    return errorResponse('Failed to delete FAQ')
  }
}

export async function toggleFAQ(id: number) {
  if (!await checkAdmin()) {
    return errorResponse('Unauthorized')
  }

  try {
    const faq = await prisma.fAQ.findUnique({ where: { id } })
    if (!faq) {
      return errorResponse('FAQ not found')
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: { isActive: !faq.isActive }
    })

    await createLog('切换FAQ状态', `切换了FAQ状态: ${updated.question} -> ${updated.isActive ? '启用' : '禁用'}`)
    revalidatePath('/admin/faq')
    
    return successResponse(updated)
  } catch (error) {
    console.error('FAQ toggle error:', error)
    return errorResponse('Failed to toggle FAQ')
  }
}

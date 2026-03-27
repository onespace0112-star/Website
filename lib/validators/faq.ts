import { z } from 'zod'

export const faqSchema = z.object({
  question: z.string().min(1, '问题不能为空'),
  answer: z.string().min(1, '答案不能为空'),
  order: z.number().int().min(0).default(0),
  typeId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true)
})

export const faqUpdateSchema = faqSchema.partial().required({ question: true, answer: true })

export type FAQInput = z.infer<typeof faqSchema>
export type FAQUpdateInput = z.infer<typeof faqUpdateSchema>

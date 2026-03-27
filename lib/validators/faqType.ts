import { z } from 'zod'

export const faqTypeSchema = z.object({
  name: z.string().min(1, '类型名称不能为空')
})

export type FAQTypeInput = z.infer<typeof faqTypeSchema>

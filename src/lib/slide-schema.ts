import { z } from 'zod'

export const CreateSlideSchema = z.object({
  title: z.string().describe('The title of the slide'),
  content: z
    .string()
    .describe('The AntV Infographic syntax string for the slide content'),
  order: z
    .number()
    .optional()
    .describe('The order index of the slide (default: next available)'),
})

export const UpdateSlideSchema = z.object({
  id: z.string().describe('The ID of the slide to update'),
  title: z.string().optional().describe('The new title of the slide'),
  content: z
    .string()
    .optional()
    .describe('The new AntV Infographic syntax string'),
  order: z.number().optional().describe('The new order index'),
})

export const DeleteSlideSchema = z.object({
  id: z.string().describe('The ID of the slide to delete'),
})

export type CreateSlide = z.infer<typeof CreateSlideSchema>
export type UpdateSlide = z.infer<typeof UpdateSlideSchema>
export type DeleteSlide = z.infer<typeof DeleteSlideSchema>

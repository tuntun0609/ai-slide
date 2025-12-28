import { z } from 'zod'

/**
 * Main Slide Content Schema containing multiple AntV Infographic instances
 */
export const SlideContentSchema = z.object({
  title: z.string().describe('The main title of the slide'),
  infographics: z
    .array(
      z.object({
        title: z
          .string()
          .optional()
          .describe('Title of this specific infographic'),
        syntax: z
          .string()
          .describe(
            'The AntV Infographic syntax string (e.g., infographic template-name\\ndata\\n  title ...)'
          ),
      })
    )
    .describe('List of infographics to be displayed on this slide'),
})

export type SlideContent = z.infer<typeof SlideContentSchema>

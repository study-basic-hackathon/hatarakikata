import z from "zod"

export const GenerateCareerEventQuestionSchema = z.object({
  content: z.string(),
})

export const GeneratedCareerEventParameterSchema = z.object({
  name: z.string().default(""),
  type: z.enum(["living", "working", "feeling"]).default("working"),
  startDate: z.string(),
  endDate: z.string(),
  tags: z.array(z.string()).default([]),
  strength: z.number().int().min(1).max(5).default(3),
  row: z.number().int().min(0).default(0),
  description: z.string().nullable().default(null),
})

export const GenerateCareerEventsResultSchema = z.object({
  events: z.array(GeneratedCareerEventParameterSchema),
  nextQuestion: GenerateCareerEventQuestionSchema.nullable(),
})

export type GenerateCareerEventQuestion = z.infer<typeof GenerateCareerEventQuestionSchema>
export type GeneratedCareerEventParameter = z.infer<typeof GeneratedCareerEventParameterSchema>
export type GenerateCareerEventsResult = z.infer<typeof GenerateCareerEventsResultSchema>

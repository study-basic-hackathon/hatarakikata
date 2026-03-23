import { z } from "zod"

export const CareerMapSnapshotEventSchema = z.object({
  name: z.string(),
  type: z.enum(["living", "working", "feeling"]).default("working"),
  startDate: z.string(),
  endDate: z.string(),
  strength: z.number().int().min(1).max(5).default(3),
  row: z.number().int().min(0).default(0),
  description: z.string().nullable().default(null),
  tagNames: z.array(z.string()).default([]),
})

export type CareerMapSnapshotEvent = z.infer<typeof CareerMapSnapshotEventSchema>

export const CareerMapSnapshotSchema = z.object({
  personName: z.string(),
  language: z.string().default("ja"),
  birthDate: z.string(),
  events: z.array(CareerMapSnapshotEventSchema),
})

export type CareerMapSnapshot = z.infer<typeof CareerMapSnapshotSchema>

import { z } from "zod"

export const EventPlacementSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  strength: z.number().int().min(1).max(5),
})

export type EventPlacement = z.infer<typeof EventPlacementSchema>

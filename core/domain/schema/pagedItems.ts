import { z } from "zod"

export const createPagedItemsSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    count: z.number(),
    offset: z.number(),
    limit: z.number(),
  })

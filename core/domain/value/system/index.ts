import { z } from "zod";

export const SystemOperationSchema = z.object({
  name: z.string()
})

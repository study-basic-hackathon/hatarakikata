import z from "zod";

import { createPagedItemsSchema } from "@/core/domain/schema"

export const UserKeySchema = z.object({
  id: z.string(),
})

export const UserPayloadSchema = z.object({
  name: z.string().nullable(),
})

export const UserSchema = UserKeySchema.extend(UserPayloadSchema.shape)
export type User = z.infer<typeof UserSchema>

export const PagedUsersSchema = createPagedItemsSchema(UserSchema)
export type PagedUsers = z.infer<typeof PagedUsersSchema>

import { z } from "zod";

import { UserSchema } from "@/core/domain";
import { SystemOperationSchema } from "@/core/domain/value/system";

export const GeneralUserExecutorSchema = z.object({
  type: z.literal("user"),
  userType: z.literal("general"),
  user: UserSchema
})

export const GuestUserExecutorSchema = z.object({
  type: z.literal("user"),
  userType: z.literal("guest"),
  user: UserSchema
})

export const UserExecutorSchema = z.discriminatedUnion("userType", [
  GeneralUserExecutorSchema,
  GuestUserExecutorSchema,
])

export const SystemExecutorSchema = z.object({
  type: z.literal("system"),
  operation: SystemOperationSchema,
})

export const ExecutorSchema = z.discriminatedUnion("type", [
  UserExecutorSchema,
  SystemExecutorSchema,
])

export type Executor = z.infer<typeof ExecutorSchema>
export type UserExecutor = z.infer<typeof UserExecutorSchema>
export type SystemExecutor = z.infer<typeof SystemExecutorSchema>

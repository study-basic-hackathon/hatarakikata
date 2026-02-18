import z from "zod";

export const CareerMapActionBaseSchema = z.object({})

export const AddFeelingEventActionSchema = CareerMapActionBaseSchema.extend({
  type: z.literal("addFeelingEvent")
})

export const AddWorkingEventActionSchema = CareerMapActionBaseSchema.extend({
  type: z.literal("addWorkingEvent")
})

export const AddConnectionEventActionSchema = CareerMapActionBaseSchema.extend({
  type: z.literal("addConnectionEvent")
})

export const AddLivingEventActionSchema = CareerMapActionBaseSchema.extend({
  type: z.literal("addLivingEvent")
})

export const CareerMapActionSchema = z.discriminatedUnion("type", [
  AddFeelingEventActionSchema,
  AddWorkingEventActionSchema,
  AddConnectionEventActionSchema,
  AddLivingEventActionSchema,
])

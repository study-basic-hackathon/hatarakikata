import { AppResult } from "@/core/util/appResult"

export type UpsertCareerMapVectorCommandParameters = {
  careerMapId: string
  embedding: number[]
  tagWeights: Record<string, number>
}

export type UpsertCareerMapVectorCommand = (params: UpsertCareerMapVectorCommandParameters) => Promise<AppResult<void>>

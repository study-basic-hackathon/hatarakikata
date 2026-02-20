import { AppResult } from "@/core/util/appResult"

export type CareerMapVector = {
  careerMapId: string
  embedding: number[]
  tagWeights: Record<string, number>
}

export type FindCareerMapVectorQuery = (careerMapId: string) => Promise<AppResult<CareerMapVector | null>>

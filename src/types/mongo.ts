export type AggregationPipeline = Record<string, unknown>[]
export type AggregationPayload = { pipeline: AggregationPipeline }
export interface AggregationCount {
  totalCount: number
}

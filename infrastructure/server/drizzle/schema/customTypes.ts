import { customType } from 'drizzle-orm/pg-core'

export const vector = customType<{ data: number[]; driverValue: string }>({
  dataType() {
    return 'vector(1536)'
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`
  },
  fromDriver(value: unknown): number[] {
    return String(value).replace(/^\[|\]$/g, '').split(',').map(Number)
  },
})

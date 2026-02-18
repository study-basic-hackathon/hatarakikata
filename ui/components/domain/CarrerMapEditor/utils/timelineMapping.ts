import type { CareerEvent, CareerMap } from "@/core/domain"
import type { TimelineConfig } from "./constants"
import { MIN_ROW_COUNT, SCALE_MONTH_WIDTH_PX } from "./constants"

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

const QUARTER_DAYS = [1, 8, 15, 22] as const

/** 日付を月の1/4区切り（1, 8, 15, 22日）に切り捨てる */
export function snapToQuarterMonth(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDate()
  const snapped = QUARTER_DAYS.findLast((q) => q <= day) ?? 1
  const y = String(d.getFullYear()).padStart(4, "0")
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(snapped).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export function dateToX(date: string, config: TimelineConfig): number {
  const origin = new Date(config.originDate)
  const target = new Date(date)
  const monthsDiff =
    (target.getFullYear() - origin.getFullYear()) * 12 +
    (target.getMonth() - origin.getMonth()) +
    (target.getDate() - 1) / daysInMonth(target.getFullYear(), target.getMonth())
  return monthsDiff * config.monthWidthInUnits * config.unit
}

export function xToDate(x: number, config: TimelineConfig): string {
  const monthsDiff = x / (config.monthWidthInUnits * config.unit)

  const origin = new Date(config.originDate)
  const totalMonths = origin.getFullYear() * 12 + origin.getMonth() + monthsDiff
  const year = Math.floor(totalMonths / 12)
  const month = Math.floor(totalMonths % 12)
  const fractionalMonth = totalMonths - (year * 12 + month)
  const day = Math.max(1, Math.round(fractionalMonth * daysInMonth(year, month)) + 1)
  const clampedDay = Math.min(day, daysInMonth(year, month))

  const y = String(year).padStart(4, "0")
  const m = String(month + 1).padStart(2, "0")
  const d = String(clampedDay).padStart(2, "0")
  return snapToQuarterMonth(`${y}-${m}-${d}`)
}

export type Rect = { x: number; y: number; width: number; height: number }

export function eventToRect(event: CareerEvent, config: TimelineConfig, visibleRows: number[]): Rect {
  const x = dateToX(event.startDate, config)
  const endX = dateToX(event.endDate, config)
  const width = Math.max(endX - x, config.unit)

  const dataRow = event.row ?? 0
  const displayIndex = visibleRows.indexOf(dataRow)
  const safeDisplayIndex = displayIndex >= 0 ? displayIndex : 0

  const rowHeight = config.rowHeightInUnits * config.unit
  const y = config.headerHeightInUnits * config.unit + safeDisplayIndex * rowHeight
  const strength = event.strength ?? 3
  const height = strength * rowHeight

  return { x, y, width, height }
}

export function computeCanvasWidth(config: TimelineConfig): number {
  return dateToX(config.endDate, config) + config.monthWidthInUnits * config.unit
}

export function computeCanvasHeight(config: TimelineConfig, rowCount: number): number {
  return config.headerHeightInUnits * config.unit + rowCount * config.rowHeightInUnits * config.unit
}

export function yToRow(y: number, config: TimelineConfig, visibleRows: number[]): number {
  const headerPx = config.headerHeightInUnits * config.unit
  const rowPx = config.rowHeightInUnits * config.unit
  const displayIndex = Math.floor((y - headerPx) / rowPx)
  const clampedIndex = Math.max(0, Math.min(displayIndex, visibleRows.length - 1))
  return visibleRows[clampedIndex]
}

export function buildTimelineConfig(startDate: string, endDate: string, scale: number): TimelineConfig {
  const originYear = startDate.slice(0, 4)
  const monthWidthPx = SCALE_MONTH_WIDTH_PX[scale - 1]
  return {
    unit: 24,
    monthWidthInUnits: monthWidthPx / 24,
    originDate: `${originYear}-01-01`,
    endDate,
    rowHeightInUnits: 1.2,
    headerHeightInUnits: 3,
    maxStrength: 5,
  }
}

export function computeTimelineConfig(careerMap: CareerMap & { startDate: string }, _events: CareerEvent[]): TimelineConfig {
  const originYear = careerMap.startDate.slice(0, 4)
  return {
    unit: 24,
    monthWidthInUnits: 4,
    originDate: `${originYear}-01-01`,
    endDate: careerMap.endDate,
    rowHeightInUnits: 1.2,
    headerHeightInUnits: 3,
    maxStrength: 5,
  }
}

export function computeVisibleRows(events: CareerEvent[], extraRows: number): number[] {
  let maxRow = -1
  for (const e of events) {
    const startRow = e.row ?? 0
    const strength = e.strength ?? 3
    const endRow = startRow + strength - 1
    if (endRow > maxRow) maxRow = endRow
  }

  const totalCount = Math.max(MIN_ROW_COUNT, maxRow + 1) + extraRows

  return Array.from({ length: totalCount }, (_, i) => i)
}

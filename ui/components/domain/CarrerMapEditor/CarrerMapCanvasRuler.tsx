import { memo, useMemo } from "react"
import { buildTimelineConfig, computeCanvasWidth } from "./utils/timelineMapping"
import { SCALE_DISPLAY_CONFIG } from "./utils/constants"

type Props = {
  startDate: string
  endDate: string
  scale: number
}

type TopLabel = {
  left: number
  width: number
  year: number
  month: number
  endYear: number
}

type TickLabel = {
  left: number
  width: number
  year: number
  month: number
  /** tick区間の先頭セグメントのみラベルを表示する */
  showLabel: boolean
}

function formatTopLabel(label: TopLabel, birthYear: number, groupMonths: number): string {
  const age = label.year - birthYear
  if (label.year !== label.endYear) {
    const endAge = label.endYear - birthYear
    return `${age}〜${endAge}歳`
  }
  if (groupMonths >= 12) {
    return `${age}歳 ${label.year}年`
  }
  return `${age}歳 ${label.year}年 ${label.month + 1}月〜`
}

function formatTickLabel(tick: TickLabel, tickMonths: number): string {
  if (tickMonths < 12) {
    return `${tick.month + 1}月`
  }
  return `${tick.year}年`
}

export default memo(function CarrerMapCanvasRuler({ startDate, endDate, scale }: Props) {
  const config = useMemo(() => buildTimelineConfig(startDate, endDate, scale), [startDate, endDate, scale])
  const displayConfig = SCALE_DISPLAY_CONFIG[scale - 1]

  const canvasWidth = computeCanvasWidth(config)
  const monthPx = config.monthWidthInUnits * config.unit
  const totalMonths = Math.ceil(canvasWidth / monthPx)

  const originDate = new Date(config.originDate)
  const originYear = originDate.getFullYear()
  const originMonth = originDate.getMonth()
  const birthYear = new Date(startDate).getFullYear()

  const { groupMonths, tickMonths } = displayConfig
  const headerHeight = config.headerHeightInUnits * config.unit

  // Generate group labels (top row)
  const topLabels = useMemo(() => {
    const labels: TopLabel[] = []
    for (let m = 0; m < totalMonths; m += groupMonths) {
      const span = Math.min(groupMonths, totalMonths - m)
      const date = new Date(originYear, originMonth + m, 1)
      const endDate = new Date(originYear, originMonth + m + span - 1, 1)
      labels.push({
        left: m * monthPx,
        width: span * monthPx,
        year: date.getFullYear(),
        month: date.getMonth(),
        endYear: endDate.getFullYear(),
      })
    }
    return labels
  }, [totalMonths, groupMonths, originYear, originMonth, monthPx])

  // Generate tick labels (グループ境界で分割してまたぎを防ぐ)
  const tickLabels = useMemo(() => {
    const labels: TickLabel[] = []
    for (let m = 0; m < totalMonths; m += tickMonths) {
      const tickEnd = Math.min(m + tickMonths, totalMonths)
      let current = m
      let isFirst = true
      while (current < tickEnd) {
        const nextGroupBoundary = Math.ceil((current + 1) / groupMonths) * groupMonths
        const segmentEnd = Math.min(tickEnd, nextGroupBoundary)
        const span = segmentEnd - current
        const date = new Date(originYear, originMonth + current, 1)
        labels.push({
          left: current * monthPx,
          width: span * monthPx,
          year: date.getFullYear(),
          month: date.getMonth(),
          showLabel: isFirst,
        })
        current = segmentEnd
        isFirst = false
      }
    }
    return labels
  }, [totalMonths, tickMonths, groupMonths, originYear, originMonth, monthPx])

  const topRowHeight = headerHeight / 3
  const bottomRowHeight = headerHeight - topRowHeight

  return (
    <div
      className="sticky top-0 z-10 border-b border-foreground/10 bg-background"
      style={{ height: headerHeight }}
    >
      {/* Top row: group labels */}
      <div className="flex" style={{ height: topRowHeight }}>
        {topLabels.map((label, i) => (
          <div
            key={i}
            className="shrink-0 flex items-center border-l border-foreground/10 first:border-l-0"
            style={{ width: label.width }}
          >
            <span className="sticky left-0 z-10 text-xs text-foreground/50 px-1 font-bold bg-background whitespace-nowrap">
              {formatTopLabel(label, birthYear, groupMonths)}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom row: tick labels */}
      <div className="flex border-t border-foreground/5" style={{ height: bottomRowHeight }}>
        {tickLabels.map((tick, i) => (
          <div
            key={i}
            className="shrink-0 border-l border-foreground/10 px-1 flex items-center first:border-l-0"
            style={{ width: tick.width }}
          >
            {tick.showLabel && (
              <span className="text-xs text-foreground/50 leading-none whitespace-nowrap">
                {formatTickLabel(tick, tickMonths)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

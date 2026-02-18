import { memo, useMemo } from "react"
import clsx from "clsx"
import { buildTimelineConfig, computeCanvasWidth } from "./utils/timelineMapping"
import { SCALE_DISPLAY_CONFIG } from "./utils/constants"

type Props = {
  startDate: string
  endDate: string
  scale: number
  visibleRows: number[]
  onAddRow: () => void
}

export default memo(function CarrerMapCanvasGrid({ startDate, endDate, scale, visibleRows, onAddRow }: Props) {
  const config = useMemo(() => buildTimelineConfig(startDate, endDate, scale), [startDate, endDate, scale])

  const canvasWidth = computeCanvasWidth(config)
  const monthPx = config.monthWidthInUnits * config.unit
  const totalMonths = Math.ceil(canvasWidth / monthPx)
  const rowHeight = config.rowHeightInUnits * config.unit
  const { tickMonths, groupMonths } = SCALE_DISPLAY_CONFIG[scale - 1]

  // Generate vertical line positions
  const verticalLines = useMemo(() => {
    const lines: Array<{ left: number; isGroup: boolean }> = []
    for (let m = tickMonths; m < totalMonths; m += tickMonths) {
      lines.push({
        left: m * monthPx,
        isGroup: m % groupMonths === 0,
      })
    }
    return lines
  }, [totalMonths, tickMonths, groupMonths, monthPx])

  return (
    <>
      {visibleRows.map((dataRow, displayIndex) => {
        const rowTop = config.headerHeightInUnits * config.unit + displayIndex * rowHeight
        return (
          <div key={dataRow}>
            <div
              className={clsx(
                "absolute border-b border-foreground/10",
                displayIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
              )}
              style={{ left: 0, top: rowTop, width: canvasWidth, height: rowHeight }}
            />
            {verticalLines.map((line) => (
              <div
                key={line.left}
                className={clsx(
                  "absolute border-l",
                  line.isGroup ? "border-foreground/10" : "border-foreground/5"
                )}
                style={{
                  left: line.left,
                  top: rowTop,
                  height: rowHeight,
                }}
              />
            ))}
          </div>
        )
      })}

      {/* Add row button */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: config.headerHeightInUnits * config.unit + visibleRows.length * rowHeight,
          width: canvasWidth,
          height: rowHeight,
        }}
      >
        <div
          className="sticky left-0 w-screen h-full border-t border-dashed border-foreground/20 flex items-center justify-center text-foreground/30 hover:text-foreground/50 hover:bg-foreground/5 cursor-pointer transition-colors select-none"
          onClick={(e) => {
            e.stopPropagation()
            onAddRow()
          }}
        >
          + 行を追加
        </div>
      </div>
    </>
  )
})

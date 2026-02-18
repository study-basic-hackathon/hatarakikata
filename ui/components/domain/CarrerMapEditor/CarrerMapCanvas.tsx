"use client"

import { useCallback, useMemo, useRef } from "react"
import { useCareerMapEventTagsQuery } from "@/ui/hooks/careerMapEventTag"
import { useCarrerMapEditorContext } from "./hooks/CarrerMapEditorContext"
import { eventToRect, computeCanvasWidth, computeCanvasHeight, xToDate, yToRow } from "./utils/timelineMapping"
import { computeVisibleRows } from "./utils/timelineMapping"
import CarrerMapCanvasRuler from "./CarrerMapCanvasRuler"
import CarrerMapCanvasGrid from "./CarrerMapCanvasGrid"
import CarrerMapCanvasItem from "./CarrerMapCanvasItem"
import CareerMapEventCard from "./CareerMapEventCard"
import { useDragInteraction } from "./hooks/useDragInteraction"
import { usePanInteraction } from "./hooks/usePanInteraction"

export default function CarrerMapCanvas() {
  const { events, careerMap, timelineConfig: config, scale, extraRows, updateEvent, openEditDialog, openCreateDialog, addRow } = useCarrerMapEditorContext()
  const tagsQuery = useCareerMapEventTagsQuery()
  const tagMap = useMemo(
    () => new Map((tagsQuery.data?.items ?? []).map((t) => [t.id, t.name])),
    [tagsQuery.data],
  )
  const visibleRows = computeVisibleRows(events, extraRows)

  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const { dragState, previewRect, handlePointerDown: handleDragPointerDown, handlePointerMove: handleDragPointerMove, handlePointerUp: handleDragPointerUp } =
    useDragInteraction(config, updateEvent, visibleRows)
  const { handlePointerDown: handlePanPointerDown, handlePointerMove: handlePanPointerMove, handlePointerUp: handlePanPointerUp } =
    usePanInteraction(scrollRef, canvasRef, !!dragState)

  const canvasWidth = computeCanvasWidth(config)
  const rowHeight = config.rowHeightInUnits * config.unit
  const addRowAreaHeight = rowHeight
  const canvasHeight = computeCanvasHeight(config, visibleRows.length) + addRowAreaHeight


  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    handlePanPointerDown(e)
  }, [handlePanPointerDown])

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    handleDragPointerMove(e)
    handlePanPointerMove(e)
  }, [handleDragPointerMove, handlePanPointerMove])

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    const wasDraggingEvent = !!dragState
    handleDragPointerUp(e)
    const wasPanning = handlePanPointerUp()

    if (wasPanning || wasDraggingEvent) return

    // Click on canvas background → create event
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const rect = canvasEl.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    const headerPx = config.headerHeightInUnits * config.unit
    if (canvasY <= headerPx) return

    const maxRowY = headerPx + visibleRows.length * rowHeight
    if (canvasY >= maxRowY) return

    const dataRow = yToRow(canvasY, config, visibleRows)
    const startDate = xToDate(canvasX, config)
    const start = new Date(startDate)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate())
    const endDate = end.toISOString().split("T")[0]
    openCreateDialog({ row: dataRow, startDate, endDate })
  }, [dragState, handleDragPointerUp, handlePanPointerUp, config, visibleRows, rowHeight, openCreateDialog])

  return (
    <div ref={scrollRef} className="w-full h-full overflow-auto relative">
      <div
        ref={canvasRef}
        className="cursor-grab"
        style={{ width: canvasWidth, height: canvasHeight, position: "relative" }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        <CarrerMapCanvasRuler
          startDate={careerMap!.startDate!}
          endDate={careerMap!.endDate}
          scale={scale}
        />

        <CarrerMapCanvasGrid
          startDate={careerMap!.startDate!}
          endDate={careerMap!.endDate}
          scale={scale}
          visibleRows={visibleRows}
          onAddRow={addRow}
        />

        {/* Event cards */}
        {events.map((event) => {
          const rect = eventToRect(event, config, visibleRows)
          const isDragging = dragState?.eventId === event.id
          const displayRect = isDragging && previewRect ? previewRect : rect
          return (
            <CarrerMapCanvasItem
              key={event.id}
              x={displayRect.x}
              y={displayRect.y}
              width={displayRect.width}
              height={displayRect.height}
            >
              <CareerMapEventCard
                event={event}
                tagNames={(event.tags ?? []).map((id) => tagMap.get(id)).filter((n): n is string => !!n)}
                isDragging={isDragging}
                onDragStart={(e, mode) => handleDragPointerDown(e, mode, event, rect)}
                onEdit={() => openEditDialog(event)}
              />
            </CarrerMapCanvasItem>
          )
        })}
      </div>
    </div>
  )
}

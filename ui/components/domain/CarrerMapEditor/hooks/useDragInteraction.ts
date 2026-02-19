"use client"

import { useCallback, useRef, useState } from "react"

import type { CareerEvent } from "@/core/domain"

import type { TimelineConfig } from "../utils/constants"
import { dateToX, type Rect, xToDate, yToRow } from "../utils/timelineMapping"

export type DragMode = "move" | "resize-start" | "resize-end" | "strength"

type DragState = {
  mode: DragMode
  eventId: string
  startPointerX: number
  startPointerY: number
  startRect: Rect
  originalEvent: CareerEvent
}

export function useDragInteraction(
  config: TimelineConfig,
  onUpdate: (event: CareerEvent) => void,
) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const [previewRect, setPreviewRect] = useState<Rect | null>(null)
  const [previewStrength, setPreviewStrength] = useState<number | null>(null)

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    mode: DragMode,
    event: CareerEvent,
    rect: Rect,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    const state: DragState = {
      mode,
      eventId: event.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRect: rect,
      originalEvent: event,
    }
    setDragState(state)
    dragStateRef.current = state
    setPreviewRect(rect)
    setPreviewStrength(event.strength ?? 3)
  }, [])

  const snapX = useCallback((x: number) => {
    return dateToX(xToDate(x, config), config)
  }, [config])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current
    if (!state) return

    const dx = e.clientX - state.startPointerX
    const dy = e.clientY - state.startPointerY
    const { startRect, mode, originalEvent } = state
    const rowHeight = config.rowHeightInUnits * config.unit

    if (mode === "move") {
      const snappedStartX = snapX(startRect.x + dx)
      const snappedEndX = snapX(startRect.x + startRect.width + dx)
      const newRow = yToRow(startRect.y + dy, config)
      const rowTopPx = config.headerHeightInUnits * config.unit + newRow * rowHeight
      const strength = originalEvent.strength ?? 3
      const height = strength * rowHeight
      setPreviewRect({
        x: snappedStartX,
        y: rowTopPx,
        width: Math.max(snappedEndX - snappedStartX, config.unit),
        height,
      })
    } else if (mode === "resize-start") {
      const snappedX = snapX(startRect.x + dx)
      const endX = startRect.x + startRect.width
      setPreviewRect({
        x: snappedX,
        y: startRect.y,
        width: Math.max(endX - snappedX, config.unit),
        height: startRect.height,
      })
    } else if (mode === "resize-end") {
      const snappedEndX = snapX(startRect.x + startRect.width + dx)
      setPreviewRect({
        x: startRect.x,
        y: startRect.y,
        width: Math.max(snappedEndX - startRect.x, config.unit),
        height: startRect.height,
      })
    } else if (mode === "strength") {
      const currentStrength = originalEvent.strength ?? 3
      const strengthDelta = dy / rowHeight
      const newStrength = Math.round(Math.min(config.maxStrength, Math.max(1, currentStrength + strengthDelta)))
      setPreviewStrength(newStrength)

      const newHeight = newStrength * rowHeight
      setPreviewRect({
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: newHeight,
      })
    }
  }, [config, snapX])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current
    if (!state) return

    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

    const dx = e.clientX - state.startPointerX
    const dy = e.clientY - state.startPointerY
    const { mode, originalEvent, startRect } = state
    const rowHeight = config.rowHeightInUnits * config.unit

    let updatedEvent: CareerEvent = { ...originalEvent }

    if (mode === "move") {
      const newStartX = startRect.x + dx
      const newEndX = newStartX + startRect.width
      const newRow = yToRow(startRect.y + dy, config)
      updatedEvent = {
        ...originalEvent,
        startDate: xToDate(newStartX, config),
        endDate: xToDate(newEndX, config),
        row: newRow,
      }
    } else if (mode === "resize-start") {
      const newWidth = Math.max(startRect.width - dx, config.unit)
      const newX = startRect.x + startRect.width - newWidth
      updatedEvent = {
        ...originalEvent,
        startDate: xToDate(newX, config),
      }
    } else if (mode === "resize-end") {
      const newWidth = Math.max(startRect.width + dx, config.unit)
      const newEndX = startRect.x + newWidth
      updatedEvent = {
        ...originalEvent,
        endDate: xToDate(newEndX, config),
      }
    } else if (mode === "strength") {
      const currentStrength = originalEvent.strength ?? 3
      const strengthDelta = dy / rowHeight
      const newStrength = Math.round(Math.min(config.maxStrength, Math.max(1, currentStrength + strengthDelta)))
      updatedEvent = {
        ...originalEvent,
        strength: newStrength,
      }
    }

    onUpdate(updatedEvent)
    setDragState(null)
    dragStateRef.current = null
    setPreviewRect(null)
    setPreviewStrength(null)
  }, [config, onUpdate])

  return {
    dragState,
    previewRect,
    previewStrength,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}

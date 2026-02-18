"use client"

import { useState, useCallback, useMemo } from "react"
import type { CareerEvent, CareerEventPayload, CareerMap } from "@/core/domain"
import type { useCareerMapQuery, useUpdateCareerMapMutation } from "@/ui/hooks/careerMap"
import type {
  useCareerEventsByCareerMapIdQuery,
  useCreateCareerEventMutation,
  useUpdateCareerEventMutation,
  useDeleteCareerEventMutation,
} from "@/ui/hooks/careerEvent"
import { type TimelineConfig, DEFAULT_TIMELINE_CONFIG, SCALE_MONTH_WIDTH_PX, SCALE_DEFAULT } from "../utils/constants"
import { computeTimelineConfig } from "../utils/timelineMapping"

export type CarrerMapEditorStatus = 'loading' | 'required-start-date' | 'ready'

export type CreatePrefill = {
  row?: number
  startDate: string
  endDate: string
}

export type DialogState =
  | { open: false }
  | { open: true; mode: "create"; prefill?: CreatePrefill }
  | { open: true; mode: "edit"; event: CareerEvent }

export type UseCarrerMapEditorOptions = {
  careerMapId: string
  careerMapQuery: ReturnType<typeof useCareerMapQuery>
  careerEventsQuery: ReturnType<typeof useCareerEventsByCareerMapIdQuery>
  updateCareerMapMutation: ReturnType<typeof useUpdateCareerMapMutation>
  createCareerEventMutation: ReturnType<typeof useCreateCareerEventMutation>
  updateCareerEventMutation: ReturnType<typeof useUpdateCareerEventMutation>
  deleteCareerEventMutation: ReturnType<typeof useDeleteCareerEventMutation>
}

export type CarrerMapEditorState = {
  status: CarrerMapEditorStatus
  careerMapId: string
  careerMap: CareerMap | undefined
  events: CareerEvent[]
  timelineConfig: TimelineConfig
  error: Error | undefined

  scale: number
  setScale: (scale: number) => void

  extraRows: number
  addRow: () => void

  updateCareerMap: (updates: Partial<Pick<CareerMap, "startDate">>) => void
  createEvent: (payload: CareerEventPayload) => void
  updateEvent: (event: CareerEvent) => void
  deleteEvent: (eventId: string) => void

  dialogState: DialogState
  openCreateDialog: (prefill?: CreatePrefill) => void
  openEditDialog: (event: CareerEvent) => void
  closeDialog: () => void
}

export function useCarrerMapEditor(options: UseCarrerMapEditorOptions): CarrerMapEditorState {
  const {
    careerMapId,
    careerMapQuery,
    careerEventsQuery,
    updateCareerMapMutation,
    createCareerEventMutation,
    updateCareerEventMutation,
    deleteCareerEventMutation,
  } = options

  const careerMap = careerMapQuery.data
  const [localEvents, setLocalEvents] = useState<CareerEvent[]>([])
  const [prevQueryData, setPrevQueryData] = useState(careerEventsQuery.data)
  const [dialogState, setDialogState] = useState<DialogState>({ open: false })
  const [error, setError] = useState<Error | undefined>(undefined)
  const [scale, setScale] = useState(SCALE_DEFAULT)
  const [extraRows, setExtraRows] = useState(0)

  const addRow = useCallback(() => {
    setExtraRows((prev) => prev + 1)
  }, [])

  // Sync from server data (update during render instead of useEffect)
  if (careerEventsQuery.data !== prevQueryData) {
    setPrevQueryData(careerEventsQuery.data)
    if (careerEventsQuery.data) {
      setLocalEvents(careerEventsQuery.data.items)
    }
  }

  // Derive status
  const status: CarrerMapEditorStatus = useMemo(() => {
    if (careerMapQuery.isLoading || careerEventsQuery.isLoading) return 'loading'
    if (!careerMap?.startDate) return 'required-start-date'
    return 'ready'
  }, [careerMapQuery.isLoading, careerEventsQuery.isLoading, careerMap?.startDate])

  // Compute timeline config
  const timelineConfig = useMemo(() => {
    if (status !== 'ready' || !careerMap?.startDate) return DEFAULT_TIMELINE_CONFIG
    const config = computeTimelineConfig(
      careerMap as CareerMap & { startDate: string },
      localEvents,
    )
    const monthWidthPx = SCALE_MONTH_WIDTH_PX[scale - 1]
    return {
      ...config,
      monthWidthInUnits: monthWidthPx / config.unit,
    }
  }, [status, careerMap, localEvents, scale])

  // Aggregate errors
  const aggregatedError =
    error ??
    careerMapQuery.error ??
    careerEventsQuery.error ??
    updateCareerMapMutation.error ??
    createCareerEventMutation.error ??
    updateCareerEventMutation.error ??
    deleteCareerEventMutation.error ??
    undefined

  // --- Handlers ---

  const handleUpdateCareerMap = useCallback(
    (updates: Partial<Pick<CareerMap, "startDate">>) => {
      setError(undefined)
      updateCareerMapMutation.mutate(
        { id: careerMapId, ...updates },
        {
          onSuccess: () => {
            careerMapQuery.refetch()
          },
          onError: (err) => {
            setError(err instanceof Error ? err : new Error(String(err)))
          },
        },
      )
    },
    [careerMapId, updateCareerMapMutation, careerMapQuery],
  )

  const handleCreateEvent = useCallback(
    (payload: CareerEventPayload) => {
      const tempId = `temp-${Date.now()}`
      const tempEvent = { ...payload, id: tempId } as CareerEvent
      setLocalEvents((prev) => [...prev, tempEvent])
      setError(undefined)

      createCareerEventMutation.mutate(payload, {
        onSuccess: (created) => {
          setLocalEvents((prev) => prev.map((e) => (e.id === tempId ? created : e)))
        },
        onError: (err) => {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLocalEvents((prev) => prev.filter((e) => e.id !== tempId))
        },
      })
    },
    [createCareerEventMutation],
  )

  const handleUpdateEvent = useCallback(
    (event: CareerEvent) => {
      setLocalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
      setError(undefined)

      const { id, ...body } = event
      updateCareerEventMutation.mutate(
        { id, ...body },
        {
          onError: (err) => {
            setError(err instanceof Error ? err : new Error(String(err)))
          },
        },
      )
    },
    [updateCareerEventMutation],
  )

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      setLocalEvents((prev) => prev.filter((e) => e.id !== eventId))
      setError(undefined)

      deleteCareerEventMutation.mutate(
        { id: eventId },
        {
          onError: (err) => {
            setError(err instanceof Error ? err : new Error(String(err)))
          },
        },
      )
    },
    [deleteCareerEventMutation],
  )

  // --- Dialog handlers ---

  const openCreateDialog = useCallback((prefill?: CreatePrefill) => {
    setDialogState({ open: true, mode: "create", prefill })
  }, [])

  const openEditDialog = useCallback((event: CareerEvent) => {
    setDialogState({ open: true, mode: "edit", event })
  }, [])

  const closeDialog = useCallback(() => {
    setDialogState({ open: false })
  }, [])

  return {
    status,
    careerMapId,
    careerMap,
    events: localEvents,
    timelineConfig,
    error: aggregatedError,
    scale,
    setScale,
    extraRows,
    addRow,
    updateCareerMap: handleUpdateCareerMap,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    dialogState,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  }
}

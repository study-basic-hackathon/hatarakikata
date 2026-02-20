import { useEffect } from "react"
import { useForm } from "react-hook-form"

import type { CareerEventPayload, CareerEventType } from "@/core/domain"
import { useCareerMapEventTagsQuery } from "@/ui/hooks/careerMapEventTag"

import { useCarrerMapEditorContext } from "../hooks/CarrerMapEditorContext"
import { fromMonth,toMonth } from "./utils"

type FormValues = {
  name: string
  type: string
  startMonth: string
  endMonth: string
  strength: number
  description: string
  tags: string[]
}

export function useCareerMapEventDialogForm() {
  const {
    careerMapId,
    dialogState,
    closeDialog,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCarrerMapEditorContext()

  const open = dialogState.open
  const mode = open ? dialogState.mode : "create"
  const event = open && dialogState.mode === "edit" ? dialogState.event : undefined

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "working",
      startMonth: "",
      endMonth: "",
      strength: 3,
      description: "",
      tags: [] as string[],
    },
  })

  const { register, handleSubmit, reset, watch, setValue } = form

  // eslint-disable-next-line react-hooks/incompatible-library
  const tags = watch("tags")
  const setTags = (newTags: string[]) => setValue("tags", newTags)

  const tagsQuery = useCareerMapEventTagsQuery()
  const availableTags = tagsQuery.data?.items ?? []
  const isLoadingTags = tagsQuery.isLoading

  useEffect(() => {
    if (open && mode === "edit" && event) {
      reset({
        name: event.name ?? "",
        type: event.type ?? "working",
        startMonth: toMonth(event.startDate),
        endMonth: toMonth(event.endDate),
        strength: event.strength ?? 3,
        description: event.description ?? "",
        tags: (event.tags ?? []).map((t) => t.id),
      })
    } else if (open && mode === "create") {
      const prefill = dialogState.mode === "create" ? dialogState.prefill : undefined
      reset({
        name: "",
        type: "working",
        startMonth: toMonth(prefill?.startDate ?? ""),
        endMonth: toMonth(prefill?.endDate ?? ""),
        strength: 3,
        description: "",
        tags: [],
      })
    }
  }, [open, mode, event, reset, dialogState])

  const onSubmit = handleSubmit((values: FormValues) => {
    const row = mode === "edit" && event ? event.row : 0

    const payload: CareerEventPayload = {
      careerMapId,
      name: values.name,
      type: values.type as CareerEventType,
      startDate: fromMonth(values.startMonth),
      endDate: fromMonth(values.endMonth),
      strength: Number(values.strength),
      tags,
      row,
      description: values.description || null,
    }

    if (mode === "edit" && event) {
      const tagNameMap = new Map(availableTags.map((t) => [t.id, t.name]))
      updateEvent({ ...event, ...payload, tags: tags.map((id) => ({ id, name: tagNameMap.get(id) ?? id })) })
    } else {
      createEvent(payload)
    }
    closeDialog()
  })

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id)
      closeDialog()
    }
  }

  return {
    open,
    mode,
    event,
    closeDialog,
    form,
    register,
    onSubmit,
    handleDelete,
    tags,
    setTags,
    availableTags,
    isLoadingTags,
  }
}

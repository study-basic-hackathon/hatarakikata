import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { CareerEventPayload } from "@/core/domain"
import { useCareerMapEventTagsQuery } from "@/ui/hooks/careerMapEventTag"
import { useCarrerMapEditorContext } from "../hooks/CarrerMapEditorContext"
import { toMonth, fromMonth } from "./utils"

type FormValues = {
  name: string
  startMonth: string
  endMonth: string
  strength: number
  description: string
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
      startMonth: "",
      endMonth: "",
      strength: 3,
      description: "",
    },
  })

  const { register, handleSubmit, reset } = form

  const [tags, setTags] = useState<string[]>([])

  const tagsQuery = useCareerMapEventTagsQuery()
  const availableTags = tagsQuery.data?.items ?? []
  const isLoadingTags = tagsQuery.isLoading

  useEffect(() => {
    if (open && mode === "edit" && event) {
      reset({
        name: event.name ?? "",
        startMonth: toMonth(event.startDate),
        endMonth: toMonth(event.endDate),
        strength: event.strength ?? 3,
        description: event.description ?? "",
      })
      setTags(event.tags ?? [])
    } else if (open && mode === "create") {
      const prefill = dialogState.mode === "create" ? dialogState.prefill : undefined
      reset({
        name: "",
        startMonth: toMonth(prefill?.startDate ?? ""),
        endMonth: toMonth(prefill?.endDate ?? ""),
        strength: 3,
        description: "",
      })
      setTags([])
    }
  }, [open, mode, event, reset, dialogState])

  const onSubmit = handleSubmit((values: FormValues) => {
    const row = mode === "edit" && event ? event.row : 0

    const payload: CareerEventPayload = {
      careerMapId,
      name: values.name,
      startDate: fromMonth(values.startMonth),
      endDate: fromMonth(values.endMonth),
      strength: Number(values.strength),
      tags,
      row,
      description: values.description || null,
    }

    if (mode === "edit" && event) {
      updateEvent({ ...event, ...payload })
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

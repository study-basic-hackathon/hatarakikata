"use client"

import Spinner from "@/ui/components/basic/Spinner"
import { useCareerMapQuery, useUpdateCareerMapMutation } from "@/ui/hooks/careerMap"
import {
  useCareerEventsByCareerMapIdQuery,
  useCreateCareerEventMutation,
  useUpdateCareerEventMutation,
  useDeleteCareerEventMutation,
} from "@/ui/hooks/careerEvent"
import { useCarrerMapEditor } from "./hooks/useCarrerMapEditor"
import { CarrerMapEditorProvider } from "./CarrerMapEditorProvider"
import CarrerMapEditorContainer from "./CarrerMapEditorContainer"
import CarrerMapCanvas from "./CarrerMapCanvas"
import CarrerMapCanvasActions from "./CarrerMapCanvasActions"
import CarrerMapRequestBirthdayDialog from "./CarrerMapRequestBirthdayDialog"
import CarrerMapCanvasPlaceholder from "./CarrerMapCanvasPlaceholder"
import CareerMapEventDialog from "./CareerMapEventDialog"
import CarrerMapErrorBanner from "./CarrerMapErrorBanner"
import CarrerMapToolBar from "./CarrerMapToolBar"

type CareerMapEditorProps = {
  careerMapId: string
}

export default function CarrerMapEditor({ careerMapId }: CareerMapEditorProps) {
  const careerMapQuery = useCareerMapQuery(careerMapId)
  const careerEventsQuery = useCareerEventsByCareerMapIdQuery(careerMapId)
  const updateCareerMapMutation = useUpdateCareerMapMutation()
  const createCareerEventMutation = useCreateCareerEventMutation()
  const updateCareerEventMutation = useUpdateCareerEventMutation()
  const deleteCareerEventMutation = useDeleteCareerEventMutation()

  const editor = useCarrerMapEditor({
    careerMapId,
    careerMapQuery,
    careerEventsQuery,
    updateCareerMapMutation,
    createCareerEventMutation,
    updateCareerEventMutation,
    deleteCareerEventMutation,
  })

  return (
    <CarrerMapEditorProvider value={editor}>
      <CarrerMapEditorContainer>
        {editor.status === 'loading' && (
          <div className="flex items-center justify-center w-full h-full">
            <Spinner />
          </div>
        )}

        {editor.status === 'required-start-date' && (
          <CarrerMapRequestBirthdayDialog />
        )}

        {editor.status === 'ready' ? (
          <>
            <CarrerMapCanvas />
            <CarrerMapCanvasActions />
            <CarrerMapToolBar />
          </>
        ) : (
          <CarrerMapCanvasPlaceholder />
        )}

        <CarrerMapErrorBanner />

        <CareerMapEventDialog />
      </CarrerMapEditorContainer>
    </CarrerMapEditorProvider>
  )
}

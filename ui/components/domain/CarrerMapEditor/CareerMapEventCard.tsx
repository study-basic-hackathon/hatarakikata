"use client"

import type { PointerEvent } from "react"
import { RiEditLine } from "react-icons/ri"
import { tv } from "tailwind-variants"

import type { CareerEvent } from "@/core/domain"

import type { DragMode } from "./hooks/useDragInteraction"

const HANDLE_SIZE = 8

const card = tv({
  base: "w-full h-full rounded border select-none flex flex-col relative group",
  variants: {
    isDragging: {
      true: "opacity-70 shadow-lg z-50",
    },
    isSelected: {
      true: "ring-2 ring-primary-500 border-primary-500",
    },
    type: {
      living: "bg-green-100 border-green-300 text-green-800",
      working: "bg-blue-100 border-blue-300 text-blue-800",
      feeling: "bg-amber-100 border-amber-300 text-amber-800",
    },
  },
  defaultVariants: {
    type: "working",
  },
})

type CareerMapEventCardProps = {
  event: CareerEvent
  tagNames: string[]
  isDragging: boolean
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onDragStart: (e: PointerEvent, mode: DragMode) => void
  onEdit: () => void
}

export default function CareerMapEventCard({
  event,
  tagNames,
  isDragging,
  isSelected,
  onSelect,
  onDragStart,
  onEdit,
}: CareerMapEventCardProps) {
  return (
    <div
      className={card({ isDragging, isSelected, type: event.type })}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(e)
      }}
    >
      {/* Edit button */}
      <button
        type="button"
        className="absolute top-0.5 right-1 z-20 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/10 p-2"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
      >
        <RiEditLine className="w-4 h-4" />
      </button>

      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 h-full cursor-col-resize z-10"
        style={{ width: HANDLE_SIZE }}
        onPointerDown={(e) => onDragStart(e, "resize-start")}
      />

      {/* Main move area */}
      <div
        className="flex-1 px-2 py-1 overflow-hidden cursor-grab active:cursor-grabbing space-y-1"
        onPointerDown={(e) => onDragStart(e, "move")}
      >
        <span className="truncate block font-medium text-sm ">
          {event.name}
        </span>
        {tagNames.length > 0 && (
          <div className="flex flex-wrap gap-0.5 overflow-hidden">
            {tagNames.map((name) => (
              <span
                key={name}
                className="inline-block rounded-full bg-black/10 px-1.5 text-[0.75em] truncate"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 h-full cursor-col-resize z-10"
        style={{ width: HANDLE_SIZE }}
        onPointerDown={(e) => onDragStart(e, "resize-end")}
      />

      {/* Bottom strength handle */}
      <div
        className="absolute bottom-0 left-0 w-full cursor-row-resize z-10"
        style={{ height: HANDLE_SIZE }}
        onPointerDown={(e) => onDragStart(e, "strength")}
      />
    </div>
  )
}

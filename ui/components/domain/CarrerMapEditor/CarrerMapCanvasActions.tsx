"use client"

import { RiAddLine, RiSearchLine, RiSparklingLine } from "react-icons/ri"
import { tv } from "tailwind-variants"

import { useCarrerMapEditorContext } from "./hooks/CarrerMapEditorContext"

const actionButton = tv({
  base: "rounded-full w-10 h-10 inline-flex items-center justify-center transition-colors cursor-pointer",
  variants: {
    variant: {
      default:
        "text-foreground/60 hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed",
      primary: "bg-primary-500 text-white hover:bg-primary-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export default function CarrerMapCanvasActions() {
  const { openCreateDialog, openGenerateDialog, openSearchDialog } = useCarrerMapEditorContext()

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-white rounded-full shadow-lg p-1.5">
      <button type="button" className={actionButton()} onClick={openSearchDialog}>
        <RiSearchLine className="text-xl" />
      </button>
      <button
        type="button"
        className={actionButton()}
        onClick={openGenerateDialog}
      >
        <RiSparklingLine className="text-xl" />
      </button>
      <button
        type="button"
        className={actionButton({ variant: "primary" })}
        onClick={() => openCreateDialog()}>
        <RiAddLine className="text-xl" />
      </button>
    </div>
  )
}

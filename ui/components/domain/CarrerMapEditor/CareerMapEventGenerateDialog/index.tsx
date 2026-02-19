"use client"

import { useState } from "react"
import { RxCross2 } from "react-icons/rx"

import Alert from "@/ui/components/basic/Alert"
import Button from "@/ui/components/basic/Button"
import Dialog from "@/ui/components/basic/dialog/Dialog"
import TextAreaField from "@/ui/components/basic/field/TextAreaField"
import { useGenerateCareerEventsMutation } from "@/ui/hooks/careerEvent"

import { useCarrerMapEditorContext } from "../hooks/CarrerMapEditorContext"

function ThinkingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm">
      <span className="text-5xl animate-bounce">🤖</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-foreground/70">AIが考え中</span>
        <span className="inline-flex gap-0.5">
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_infinite]" />
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
        </span>
      </div>
    </div>
  )
}

export default function CareerMapEventGenerateDialog() {
  const {
    careerMapId,
    events,
    addEvents,
    generateDialogOpen,
    closeGenerateDialog,
  } = useCarrerMapEditorContext()

  const [input, setInput] = useState("")
  const [nextQuestion, setNextQuestion] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const generateMutation = useGenerateCareerEventsMutation()

  const handleClose = () => {
    if (generateMutation.isPending) return
    setInput("")
    setNextQuestion(null)
    setErrorMessage(null)
    closeGenerateDialog()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || generateMutation.isPending) return

    setErrorMessage(null)

    try {
      const result = await generateMutation.mutateAsync({
        careerMapId,
        input: trimmed,
        currentEvents: events,
      })

      addEvents(result.events)

      setInput("")
      setNextQuestion(result.nextQuestion?.content ?? null)

      if (!result.nextQuestion) {
        handleClose()
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <Dialog open={generateDialogOpen} onClose={handleClose} className="w-full max-w-md">
      <div className="relative">
        {generateMutation.isPending && <ThinkingOverlay />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-foreground/10 transition-colors"
              aria-label="閉じる"
              disabled={generateMutation.isPending}
            >
              <RxCross2 size={20} />
            </button>
            <h2 className="text-lg font-bold">AIでイベントを生成</h2>
            <div className="w-7" />
          </div>

          <TextAreaField
            label="自由入力"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={nextQuestion ? `次の質問: ${nextQuestion}` : "例: 大学卒業後にIT企業に入社してPMになった"}
            disabled={generateMutation.isPending}
          />

          {nextQuestion && (
            <p className="text-sm text-foreground/70">次の質問: {nextQuestion}</p>
          )}

          {errorMessage && (
            <Alert variant="error">{errorMessage}</Alert>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="medium" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "生成中..." : "生成"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

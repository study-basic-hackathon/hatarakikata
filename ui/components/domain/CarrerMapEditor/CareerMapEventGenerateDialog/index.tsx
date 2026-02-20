"use client"

import { useCallback, useState } from "react"
import { RiMic2Fill, RiMic2Line } from "react-icons/ri"
import { RxCross2 } from "react-icons/rx"

import Alert from "@/ui/components/basic/Alert"
import Button from "@/ui/components/basic/Button"
import Dialog from "@/ui/components/basic/dialog/Dialog"
import TextAreaField from "@/ui/components/basic/field/TextAreaField"
import { useGenerateCareerEventsMutation } from "@/ui/hooks/careerEvent"
import { useSpeechRecognition } from "@/ui/hooks/useSpeechRecognition"

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

  const handleSpeechResult = useCallback((text: string) => {
    setInput((prev) => prev + text)
  }, [])
  const { isListening, isSupported, audioLevels, start: startListening, stop: stopListening } = useSpeechRecognition(handleSpeechResult)

  const handleClose = () => {
    if (generateMutation.isPending) return
    stopListening()
    setInput("")
    setNextQuestion(null)
    setErrorMessage(null)
    closeGenerateDialog()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || generateMutation.isPending) return

    stopListening()
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

          <div>
            <TextAreaField
              label="自由入力"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder={nextQuestion ? `次の質問: ${nextQuestion}` : "例: 大学卒業後にIT企業に入社してPMになった"}
              disabled={generateMutation.isPending}
            />
            {isSupported && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={generateMutation.isPending}
                  className={`shrink-0 rounded-full p-2 transition-colors ${
                    isListening
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "text-foreground/60 hover:bg-foreground/10"
                  } disabled:opacity-40`}
                  aria-label={isListening ? "音声入力を停止" : "音声入力を開始"}
                >
                  {isListening ? <RiMic2Fill size={20} /> : <RiMic2Line size={20} />}
                </button>
                {isListening && (
                  <div className="flex h-6 items-end gap-px">
                    {audioLevels.map((level, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-red-400"
                        style={{
                          height: `${Math.max(8, level * 100)}%`,
                          transition: "height 80ms ease-out",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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

"use client"

import { useMemo,useState } from "react"
import { IoChevronBack, IoChevronForward } from "react-icons/io5"

import Alert from "@/ui/components/basic/Alert"
import Button from "@/ui/components/basic/Button"
import Dialog from "@/ui/components/basic/dialog/Dialog"

import { useCarrerMapEditorContext } from "./hooks/CarrerMapEditorContext"

type Step = "year" | "month" | "day"

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function YearStep({
  value,
  onChange,
}: {
  value: number | null
  onChange: (year: number) => void
}) {
  const [rangeStart, setRangeStart] = useState(() => {
    if (value) return Math.floor(value / 10) * 10
    return 1990
  })

  const years = Array.from({ length: 10 }, (_, i) => rangeStart + i)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRangeStart((s) => s - 10)}
          className="rounded-lg px-3 py-1 text-lg hover:bg-foreground/5"
        >
          <IoChevronBack />
        </button>
        <span className="text-sm font-medium text-foreground/60">
          {rangeStart} - {rangeStart + 9}
        </span>
        <button
          type="button"
          onClick={() => setRangeStart((s) => s + 10)}
          className="rounded-lg px-3 py-1 text-lg hover:bg-foreground/5"
        >
          <IoChevronForward />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onChange(year)}
            className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
              value === year
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-foreground/20 hover:bg-foreground/5"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}

function MonthStep({
  value,
  onChange,
}: {
  value: number | null
  onChange: (month: number) => void
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-4 gap-2">
      {months.map((month) => (
        <button
          key={month}
          type="button"
          onClick={() => onChange(month)}
          className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
            value === month
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          {month}月
        </button>
      ))}
    </div>
  )
}

function DayStep({
  year,
  month,
  value,
  onChange,
}: {
  year: number
  month: number
  value: number | null
  onChange: (day: number) => void
}) {
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month])
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onChange(day)}
          className={`rounded-lg border px-1 py-2 text-sm transition-colors ${
            value === day
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  )
}

export default function CarrerMapRequestBirthdayDialog() {
  const { updateCareerMap } = useCarrerMapEditorContext()
  const [step, setStep] = useState<Step>("year")
  const [year, setYear] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)
  const [day, setDay] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelectYear = (y: number) => {
    setYear(y)
    setMonth(null)
    setDay(null)
    setStep("month")
  }

  const handleSelectMonth = (m: number) => {
    setMonth(m)
    setDay(null)
    setStep("day")
  }

  const handleSelectDay = (d: number) => {
    setDay(d)
  }

  const handleSubmit = () => {
    if (!year || !month || !day) {
      setError("生年月日を入力してください")
      return
    }
    setError(null)
    const m = String(month).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    updateCareerMap({ startDate: `${year}-${m}-${d}` })
  }

  const stepLabel = step === "year" ? "年" : step === "month" ? "月" : "日"

  return (
    <Dialog open={true} onClose={() => {}} className="w-full max-w-sm">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">生年月日を選択してください</h2>

        <div className="flex items-center gap-1 justify-center">
          <button
            type="button"
            onClick={() => { setStep("year"); setMonth(null); setDay(null) }}
            className={`rounded px-2 py-1 font-medium ${
              step === "year" ? "bg-foreground/10" : "hover:bg-foreground/5"
            }`}
          >
            <span className="text-2xl mr-1">{year ?? '----'}</span>
            <span className="text-lg">年</span>
          </button>
          <span className="text-foreground/30">/</span>
          <button
            type="button"
            onClick={() => { if (year) { setStep("month"); setDay(null) } }}
            disabled={!year}
            className={`rounded px-2 py-1 font-medium disabled:opacity-40 ${
              step === "month" ? "bg-foreground/10" : "hover:bg-foreground/5"
            }`}
          >
            <span className="text-2xl mr-1">{month ?? '--'}</span>
            <span className="text-lg">月</span>
          </button>
          <span className="text-foreground/30">/</span>
          <span className={`rounded px-2 py-1 font-medium ${
            step === "day" ? "bg-foreground/10" : ""
          }`}>
            <span className="text-2xl mr-1">{day ?? '--'}</span>
            <span className="text-lg">日</span>
          </span>
        </div>

        <div className="text-sm font-medium text-foreground/60">{stepLabel}を選んでください</div>

        <div className="min-h-52">
          {step === "year" && (
            <YearStep value={year} onChange={handleSelectYear} />
          )}
          {step === "month" && (
            <MonthStep value={month} onChange={handleSelectMonth} />
          )}
          {step === "day" && year && month && (
            <DayStep year={year} month={month} value={day} onChange={handleSelectDay} />
          )}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={handleSubmit}
          >
            確定
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

"use client"

import clsx from "clsx"
import { forwardRef,InputHTMLAttributes } from "react"

type StepFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string
  error?: string
  min: number
  max: number
  step?: number
}

const StepField = forwardRef<HTMLInputElement, StepFieldProps>(
  ({ label, error, id, min, max, step = 1, className, ...props }, ref) => {
    const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

    return (
      <div className={clsx("flex flex-col gap-1", className)}>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          className="w-full"
          {...props}
        />
        <div className="flex justify-between text-xs text-foreground/50">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

StepField.displayName = "StepField"

export default StepField

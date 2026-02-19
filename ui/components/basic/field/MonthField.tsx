"use client"

import clsx from "clsx"
import { forwardRef,InputHTMLAttributes } from "react"

type MonthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string
  error?: string
}

const MonthField = forwardRef<HTMLInputElement, MonthFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className={clsx("flex flex-col gap-1", className)}>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          type="month"
          id={id}
          className="w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

MonthField.displayName = "MonthField"

export default MonthField

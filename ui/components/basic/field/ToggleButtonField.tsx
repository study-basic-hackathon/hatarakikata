"use client"

import clsx from "clsx"

type Option<T extends string> = {
  value: T
  label: string
}

type ToggleButtonFieldProps<T extends string> = {
  label: string
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  error?: string
  className?: string
}

export default function ToggleButtonField<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
  className,
}: ToggleButtonFieldProps<T>) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex-1 rounded-lg px-2 py-1.5 text-sm font-medium border transition-colors",
              value === option.value
                ? "bg-primary-500 text-white border-primary-500 hover:bg-primary-600"
                : "bg-transparent text-foreground/70 border-foreground/20 hover:bg-foreground/5"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

"use client"

import clsx from "clsx"
import { RxCross2 } from "react-icons/rx"

type TagsFieldProps = {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  error?: string
  className?: string
}

export default function TagsField({
  label,
  value,
  onChange,
  error,
  className,
}: TagsFieldProps) {
  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label className="text-sm font-medium">{label}</label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-0.5 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full hover:bg-foreground/20 p-0.5 transition-colors"
                aria-label={`${tag}を削除`}
              >
                <RxCross2 size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

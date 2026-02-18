"use client";

import clsx from "clsx";
import { SelectHTMLAttributes, forwardRef } from "react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
};

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, id, options, className, ...props }, ref) => {
    return (
      <div className={clsx("flex flex-col gap-1", className)}>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;

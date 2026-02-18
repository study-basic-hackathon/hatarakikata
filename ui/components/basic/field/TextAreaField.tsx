"use client";

import clsx from "clsx";
import TextArea from "../input/TextArea";
import { TextareaHTMLAttributes, forwardRef } from "react";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className={clsx("flex flex-col gap-1", className)}>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <TextArea ref={ref} id={id} {...props} />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;

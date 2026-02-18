"use client";

import clsx from "clsx";
import { TextareaHTMLAttributes, forwardRef } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50",
          className
        )}
        rows={4}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;

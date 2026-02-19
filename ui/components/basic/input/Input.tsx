"use client";

import { forwardRef,InputHTMLAttributes } from "react";
import { tv } from "tailwind-variants";

const input = tv({
  base: "w-full rounded-lg border border-foreground/20 bg-background px-4 py-3 text-base placeholder:text-foreground/50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50",
});

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={input({ className })}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

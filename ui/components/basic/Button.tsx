"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "medium" | "large";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600",
  secondary:
    "bg-secondary-500 text-white hover:bg-secondary-600",
  outline:
    "border border-foreground/20 bg-transparent hover:bg-foreground/5",
  ghost: "bg-transparent hover:bg-foreground/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  medium: "px-3 py-2 text-sm",
  large: "px-4 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "large",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

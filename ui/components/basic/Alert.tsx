"use client";

import { ReactNode } from "react";
import { tv } from "tailwind-variants";

const alert = tv({
  base: "rounded-md p-4 text-sm",
  variants: {
    variant: {
      info: "bg-blue-50 text-blue-800",
      success: "bg-green-50 text-green-800",
      warning: "bg-yellow-50 text-yellow-800",
      error: "bg-red-50 text-red-800",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

type AlertProps = {
  variant?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
};

export default function Alert({
  variant,
  children,
  className,
}: AlertProps) {
  return (
    <div role="alert" className={alert({ variant, className })}>
      {children}
    </div>
  );
}

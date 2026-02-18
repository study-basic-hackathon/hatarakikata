"use client";

import Button from "../Button";
import Dialog from "./Dialog";

type ConfirmDialogVariant = "primary" | "danger";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  variant?: ConfirmDialogVariant;
  title: string;
  message: string;
  submitLabel: string;
  cancelLabel: string;
  disabled?: boolean;
};

const submitVariantStyles: Record<ConfirmDialogVariant, string> = {
  primary: "",
  danger: "bg-red-600 hover:bg-red-700",
};

export default function ConfirmDialog({
  open,
  onClose,
  onSubmit,
  variant = "primary",
  title,
  message,
  submitLabel,
  cancelLabel,
  disabled = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-foreground/60">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="medium"
            className="flex-1"
            onClick={onClose}
            disabled={disabled}
          >
            {cancelLabel}
          </Button>
          <Button
            size="medium"
            className={`flex-1 ${submitVariantStyles[variant]}`}
            onClick={onSubmit}
            disabled={disabled}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

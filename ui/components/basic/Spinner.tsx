import clsx from "clsx";

type SpinnerSize = "small" | "medium" | "large";

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

const sizeStyles: Record<SpinnerSize, string> = {
  small: "h-4 w-4 border-2",
  medium: "h-8 w-8 border-3",
  large: "h-12 w-12 border-4",
};

export default function Spinner({ size = "medium", className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-foreground/20 border-t-primary-500",
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="読み込み中"
    />
  );
}

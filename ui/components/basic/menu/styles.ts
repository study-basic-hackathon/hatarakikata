import { tv } from "tailwind-variants"

export const menuListItem = tv({
  slots: {
    root: "flex items-center gap-3 p-4 hover:bg-foreground/5 border-foreground/5",
    iconWrapper: "text-xl text-foreground/60",
    content: "flex-1 min-w-0",
    primary: "text-md text-foreground/100",
    secondary: "text-sm text-foreground/50",
  },
})

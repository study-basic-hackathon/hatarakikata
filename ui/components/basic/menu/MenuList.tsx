import { PropsWithChildren } from "react"

export type MenuListProps = PropsWithChildren

export default function MenuList({ children }: MenuListProps) {
  return (
    <div className="divide-y divide-foreground/10">
      {children}
    </div>
  )
}

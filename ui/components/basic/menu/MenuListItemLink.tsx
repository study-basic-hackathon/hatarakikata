import Link from "next/link"
import { RiArrowRightSLine } from "react-icons/ri"

import { menuListItem } from "./styles"
import { MenuListItemProps } from "./types"

export type MenuListItemLinkProps = MenuListItemProps & {
  to: string
}

const { root, iconWrapper, content, primary, secondary } = menuListItem()

export default function MenuListItemLink({
  to,
  primaryText,
  secondaryText,
  icon = null,
  actionIcon = <RiArrowRightSLine className="text-xl text-foreground/40" />,
}: MenuListItemLinkProps) {
  return (
    <Link href={to} className={root()}>
      {icon && (
        <span className={iconWrapper()}>{icon}</span>
      )}
      <div className={content()}>
        <p className={primary()}>{primaryText}</p>
        {secondaryText && <p className={secondary()}>{secondaryText}</p>}
      </div>
      {actionIcon}
    </Link>
  )
}

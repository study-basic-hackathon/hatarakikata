import { RiArrowRightSLine } from "react-icons/ri"
import { MenuListItemProps } from "./types"
import { menuListItem } from "./styles"

export type MenuListItemButtonProps = MenuListItemProps & {
  onClick: () => void
  disabled?: boolean
}

const { root, iconWrapper, content, primary, secondary } = menuListItem()

export default function MenuListItemButton({
  onClick,
  primaryText,
  secondaryText,
  icon = null,
  actionIcon = <RiArrowRightSLine className="text-xl text-foreground/40" />,
  disabled = false,
}: MenuListItemButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={root({ className: "w-full text-left disabled:opacity-50" })}
    >
      {icon && (
        <span className={iconWrapper()}>{icon}</span>
      )}
      <div className={content()}>
        <p className={primary()}>{primaryText}</p>
        {secondaryText && <p className={secondary()}>{secondaryText}</p>}
      </div>
      {actionIcon}
    </button>
  )
}

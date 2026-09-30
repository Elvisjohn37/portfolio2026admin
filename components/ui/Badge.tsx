import cls from "classnames"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/ui/Icons"

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary"

type BadgeProps = {
    tone?: Tone
    icon?: IconName
    children: ReactNode
    className?: string
    title?: string
}

const Badge = ({ tone = "neutral", icon, children, className, title }: BadgeProps) => (
    <span className={cls("admin-badge", `admin-badge--${tone}`, className)} title={title}>
        {icon ? <Icon name={icon} size={12} strokeWidth={2.2} /> : null}
        {children}
    </span>
)

export { Badge }
export default Badge

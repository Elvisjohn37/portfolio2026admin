import Link from "next/link"
import cls from "classnames"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"
import { Icon, Spinner, type IconName } from "@/components/ui/Icons"

type Variant = "primary" | "ghost" | "soft" | "danger"
type Size = "md" | "sm" | "icon"

type CommonProps = {
    variant?: Variant
    size?: Size
    icon?: IconName
    iconRight?: IconName
    loading?: boolean
    children?: ReactNode
    className?: string
}

const buttonClass = (
    { variant = "primary", size = "md", className }: { className?: string; variant?: Variant; size?: Size },
    extra?: string,
) =>
    cls(
        "admin-btn",
        `admin-btn--${variant}`,
        size === "sm" && "admin-btn--sm",
        size === "icon" && "admin-btn--icon",
        extra,
        className,
    )

type ButtonProps = CommonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

const Button = ({
    icon,
    iconRight,
    loading,
    children,
    disabled,
    type = "button",
    variant,
    size,
    className,
    ...rest
}: ButtonProps) => (
    <button
        {...rest}
        type={type}
        disabled={disabled || loading}
        className={buttonClass({ variant, size, className })}
    >
        {loading ? <Spinner /> : icon ? <Icon name={icon} size={16} /> : null}
        {children}
        {iconRight && !loading ? <Icon name={iconRight} size={16} /> : null}
    </button>
)

type LinkButtonProps = CommonProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** Same visuals as <Button> but renders a real link ("View site", empty states). */
const LinkButton = ({
    icon,
    iconRight,
    children,
    variant,
    size,
    className,
    target,
    ...rest
}: LinkButtonProps) => {
    const external = rest.href.startsWith("http")

    return (
        <Link
            {...rest}
            target={target ?? (external ? "_blank" : undefined)}
            rel={external ? "noreferrer" : undefined}
            className={buttonClass({ variant, size, className })}
        >
            {icon ? <Icon name={icon} size={16} /> : null}
            {children}
            {iconRight ? <Icon name={iconRight} size={16} /> : null}
        </Link>
    )
}

export { Button, LinkButton }
export default Button


import cls from "classnames"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/ui/Icons"

type SectionCardProps = {
    title?: string
    hint?: string
    actions?: ReactNode
    /** Removes padding for tables/toolbar layouts. */
    bare?: boolean
    className?: string
    children: ReactNode
}

const SectionCard = ({
    title,
    hint,
    actions,
    bare,
    className,
    children,
}: SectionCardProps) => (
    <section className={cls("admin-card admin-section", className)}>
        {title || actions ? (
            <div className="admin-section__head">
                <div className="min-w-0">
                    {title ? <h2 className="admin-section__title">{title}</h2> : null}
                    {hint ? <p className="admin-section__hint">{hint}</p> : null}
                </div>
                {actions ? <div className="admin-row" style={{ justifyContent: "flex-end" }}>{actions}</div> : null}
            </div>
        ) : null}
        {bare ? children : <div className={cls(bare && "p-0")}>{children}</div>}
    </section>
)

type StatCardProps = {
    label: string
    value: ReactNode
    icon: IconName
    foot?: ReactNode
    loading?: boolean
}

const StatCard = ({ label, value, icon, foot, loading }: StatCardProps) => (
    <div className="admin-card admin-stat">
        <div className="admin-stat__top">
            <p className="admin-stat__label">{label}</p>
            <span className="admin-stat__icon">
                <Icon name={icon} size={17} />
            </span>
        </div>
        <p className="admin-stat__value">{loading ? "…" : value}</p>
        {foot ? <p className="admin-stat__foot">{foot}</p> : null}
    </div>
)

export { SectionCard, StatCard }

import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/ui/Icons"

type EmptyStateProps = {
    icon?: IconName
    title: string
    description?: string
    action?: ReactNode
}

const EmptyState = ({ icon = "inbox", title, description, action }: EmptyStateProps) => (
    <div className="admin-empty">
        <span className="admin-empty__icon">
            <Icon name={icon} size={22} />
        </span>
        <h3 className="admin-empty__title">{title}</h3>
        {description ? <p className="admin-empty__text">{description}</p> : null}
        {action ? <div className="admin-row" style={{ justifyContent: "center" }}>{action}</div> : null}
    </div>
)

export { EmptyState }
export default EmptyState

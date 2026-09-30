import type { ReactNode } from "react"

type PageHeaderProps = {
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
}

const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
    <header className="admin-page-head">
        <div className="min-w-0">
            {eyebrow ? <p className="admin-page-head__eyebrow">{eyebrow}</p> : null}
            <h1 className="admin-page-head__title">{title}</h1>
            {description ? <p className="admin-page-head__sub">{description}</p> : null}
        </div>
        {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
)

export { PageHeader }
export default PageHeader

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import cls from "classnames"
import { APP_INITIALS, APP_NAME, NAV_GROUPS, PORTFOLIO_URL } from "@/lib/constants"
import { useAuth, useUnreadMessages } from "@/components/providers/app-providers"
import { Icon } from "@/components/ui/Icons"

type SidebarProps = {
    open: boolean
    onClose: () => void
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const pathname = usePathname()
    const { user, isAdmin } = useAuth()
    const unread = useUnreadMessages(true)

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === href : pathname.startsWith(href)

    return (
        <>
            <div
                className={cls("admin-scrim", !open && "hidden")}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className={cls("admin-sidebar", open && "is-open")}>
                <div className="admin-sidebar__brand">
                    <span className="admin-sidebar__mark">{APP_INITIALS}</span>
                    <div className="min-w-0">
                        <p className="admin-cell__title truncate">{APP_NAME}</p>
                        <p className="admin-cell__sub truncate">
                            {user.name.split(" ")[0]} · {user.role}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--icon admin-only-mobile"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <Icon name="close" size={16} />
                    </button>
                </div>

                <nav className="admin-nav">
                    {NAV_GROUPS.map(group => {
                        const items = group.items.filter(item => !item.adminOnly || isAdmin)

                        if (!items.length) return null

                        return (
                            <div key={group.title}>
                                <p className="admin-nav__group-title">{group.title}</p>
                                {items.map(item => {
                                    const active = isActive(item.href)
                                    const count = item.badge === "unread" ? unread : 0

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cls("admin-nav__link", active && "is-active")}
                                            onClick={onClose}
                                        >
                                            <Icon name={item.icon} size={17} />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {count > 0 ? (
                                                <span className="admin-nav__count">{count}</span>
                                            ) : null}
                                        </Link>
                                    )
                                })}
                            </div>
                        )
                    })}
                </nav>

                <div className="admin-sidebar__foot">
                    <a
                        className="admin-nav__link"
                        href={PORTFOLIO_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon name="external" size={17} />
                        <span className="flex-1 truncate">View live site</span>
                    </a>
                    <div className="admin-row" style={{ padding: "0.4rem 0.55rem 0" }}>
                        <span className="admin-avatar" aria-hidden="true">
                            {APP_INITIALS}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="admin-cell__title truncate">{user.name}</p>
                            <p className="admin-cell__sub truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

export { Sidebar }
export default Sidebar

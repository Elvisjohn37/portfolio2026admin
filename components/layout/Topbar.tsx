"use client"

import { usePathname } from "next/navigation"
import { NAV_GROUPS, PORTFOLIO_URL } from "@/lib/constants"
import { useAuth } from "@/components/providers/app-providers"
import { Icon } from "@/components/ui/Icons"
import { LinkButton } from "@/components/ui/Button"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { initials } from "@/lib/format"

const NAV_ITEMS = NAV_GROUPS.flatMap(group =>
    group.items.map(item => ({ ...item, group: group.title })),
)

const useCurrentPage = () => {
    const pathname = usePathname()

    const match = [...NAV_ITEMS]
        .sort((a, b) => b.href.length - a.href.length)
        .find(item =>
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href),
        )

    return match ?? NAV_ITEMS[0]
}

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const page = useCurrentPage()
    const { user, logout } = useAuth()

    return (
        <header className="admin-topbar">
            <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--icon admin-only-mobile"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Icon name="menu" size={18} />
            </button>

            <div className="min-w-0 flex-1">
                <h2 className="admin-topbar__title truncate">{page.label}</h2>
                <p className="admin-topbar__crumb truncate">
                    {page.group} · {page.description}
                </p>
            </div>

            <LinkButton href={PORTFOLIO_URL} variant="ghost" size="sm" icon="external" className="admin-hidden-mobile">
                View site
            </LinkButton>

            <ThemeToggle />

            <div className="admin-row" style={{ gap: "0.5rem" }}>
                <span className="admin-avatar" title={`${user.name} (${user.role})`}>
                    {initials(user.name)}
                </span>
                <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => void logout()}
                    title="Sign out"
                >
                    <Icon name="logout" size={16} />
                    <span className="admin-hidden-mobile">Sign out</span>
                </button>
            </div>
        </header>
    )
}

export { Topbar }
export default Topbar

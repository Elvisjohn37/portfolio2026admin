import type { IconName } from "@/components/ui/Icons"
import type { MessageStatus } from "@/types"

/** httpOnly cookie that stores the JWT issued by the API. */
export const TOKEN_COOKIE = "portfolio_admin_token"

/** Base URL of the Express API. Read on the server only. */
export const API_URL =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

/** Public portfolio, linked from the sidebar. */
export const PORTFOLIO_URL =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3000"

/** Kept in sync with JWT_EXPIRES_IN on the API. */
export const SESSION_MAX_AGE_SECONDS = Number(process.env.SESSION_MAX_AGE_SECONDS ?? 86400)

export const APP_NAME = "Portfolio Admin"
export const APP_INITIALS = "EJ"

export type NavItem = {
    href: string
    label: string
    icon: IconName
    description: string
    adminOnly?: boolean
    badge?: "unread"
}

export type NavGroup = {
    title: string
    items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
    {
        title: "Overview",
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: "grid",
                description: "Everything at a glance",
            },
        ],
    },
    {
        title: "Content",
        items: [
            {
                href: "/dashboard/profile",
                label: "Profile",
                icon: "user",
                description: "Hero, bio and contact details",
            },
            {
                href: "/dashboard/projects",
                label: "Projects",
                icon: "folder",
                description: "Project cards, galleries and stacks",
            },
            {
                href: "/dashboard/experience",
                label: "Work experience",
                icon: "briefcase",
                description: "Timeline of roles",
            },
            {
                href: "/dashboard/about-blocks",
                label: "About blocks",
                icon: "layers",
                description: "Skill blurbs per tech stack",
            },
            {
                href: "/dashboard/tech-stacks",
                label: "Stack groups",
                icon: "database",
                description: "Frontend / Backend / Tools groups",
            },
        ],
    },
    {
        title: "Inbox",
        items: [
            {
                href: "/dashboard/messages",
                label: "Messages",
                icon: "mail",
                description: "Messages from the contact form",
                badge: "unread",
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                href: "/dashboard/team",
                label: "Team",
                icon: "users",
                description: "Who can sign in to this panel",
                adminOnly: true,
            },
            {
                href: "/dashboard/account",
                label: "Settings",
                icon: "settings",
                description: "Your profile and password",
            },
        ],
    },
]

export const MESSAGE_STATUSES: { value: MessageStatus; label: string; tone: string }[] = [
    { value: "new", label: "New", tone: "primary" },
    { value: "read", label: "Read", tone: "info" },
    { value: "replied", label: "Replied", tone: "success" },
    { value: "archived", label: "Archived", tone: "neutral" },
]

export const LIST_PAGE_SIZE = 10

/** Options for the `?limit=` query parameter. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50]

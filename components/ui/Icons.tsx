import type { ReactNode, SVGProps } from "react"

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number }

const IconBase = ({ size = 18, strokeWidth = 1.7, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
    />
)

const ICONS = {
    grid: (
        <>
            <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
            <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
            <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
            <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
        </>
    ),
    user: (
        <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7.5" r="4" />
        </>
    ),
    users: (
        <>
            <path d="M16.5 21v-1.8a3.8 3.8 0 0 0-3.8-3.8H6.3a3.8 3.8 0 0 0-3.8 3.8V21" />
            <circle cx="9.5" cy="7.5" r="3.8" />
            <path d="M21.5 21v-1.8a3.8 3.8 0 0 0-2.9-3.7" />
            <path d="M15.6 3.9a3.8 3.8 0 0 1 0 7.3" />
        </>
    ),
    folder: (
        <path d="M4 20.5h16a2 2 0 0 0 2-2V8.4a2 2 0 0 0-2-2h-7.4a2 2 0 0 1-1.7-.9L9.5 3.9a2 2 0 0 0-1.7-.9H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
    ),
    briefcase: (
        <>
            <rect x="2.5" y="7.5" width="19" height="13.5" rx="2" />
            <path d="M16 21V5.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2V21" />
            <path d="M2.5 12.5h19" />
        </>
    ),
    layers: (
        <>
            <path d="m12 2.5 9 4.8-9 4.8-9-4.8 9-4.8Z" />
            <path d="m3 12.2 9 4.8 9-4.8" />
            <path d="m3 16.9 9 4.8 9-4.8" />
        </>
    ),
    database: (
        <>
            <ellipse cx="12" cy="5.5" rx="8.5" ry="3" />
            <path d="M3.5 5.5v13c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-13" />
            <path d="M3.5 12c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3" />
        </>
    ),
    mail: (
        <>
            <rect x="2.5" y="4.5" width="19" height="15" rx="2.4" />
            <path d="m3.5 7.5 8.5 5.6 8.5-5.6" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3" />
        </>
    ),
    logout: (
        <>
            <path d="M9.5 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5" />
            <path d="m16 16.5 4.5-4.5L16 7.5" />
            <path d="M20.5 12H9.5" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
        </>
    ),
    moon: <path d="M20.9 13.3A8.9 8.9 0 1 1 10.7 3.1a7 7 0 0 0 10.2 10.2Z" />,
    menu: <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />,
    close: <path d="M17.5 6.5 6.5 17.5M6.5 6.5l11 11" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
        <>
            <circle cx="11" cy="11" r="6.8" />
            <path d="m20.5 20.5-4.8-4.8" />
        </>
    ),
    edit: (
        <>
            <path d="M12.5 20.5H21" />
            <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.6 18.4l-4.1 1.1 1.1-4.1Z" />
        </>
    ),
    trash: (
        <>
            <path d="M3.5 6.5h17" />
            <path d="M8.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h4.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
            <path d="M18.5 6.5v12.7a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6.5" />
            <path d="M10.5 11v5.5M13.5 11v5.5" />
        </>
    ),
    star: <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1.1 6.1L12 17.2l-5.5 2.9 1.1-6.1L3.2 9.7l6.1-.9Z" />,
    check: <path d="m20 6.5-11 11-5-5" />,
    external: (
        <>
            <path d="M17.5 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h6" />
            <path d="M14 3.5h6.5V10" />
            <path d="M10.5 13.5 20.5 3.5" />
        </>
    ),
    chevronLeft: <path d="m14.5 18-6-6 6-6" />,
    chevronRight: <path d="m9.5 6 6 6-6 6" />,
    chevronDown: <path d="m6 9.5 6 6 6-6" />,
    trendUp: (
        <>
            <path d="m3.5 16.5 6-6 4 4 7-7" />
            <path d="M14.5 7.5h6.5V14" />
        </>
    ),
    refresh: (
        <>
            <path d="M20.5 12a8.5 8.5 0 1 1-2.8-6.3" />
            <path d="M20.5 3.5v6h-6" />
        </>
    ),
    alert: (
        <>
            <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9.5v4M12 17.2h.01" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 16.5v-5M12 8h.01" />
        </>
    ),
    eye: (
        <>
            <path d="M2.5 12S6.4 5.5 12 5.5 21.5 12 21.5 12 17.6 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    eyeOff: (
        <>
            <path d="M3.5 3.5 20.5 20.5" />
            <path d="M10.6 6a9.9 9.9 0 0 1 1.4-.1c5.6 0 9.5 6.1 9.5 6.1a18.2 18.2 0 0 1-3 3.8" />
            <path d="M6.6 6.9A17.7 17.7 0 0 0 2.5 12s3.9 6.1 9.5 6.1a9.6 9.6 0 0 0 4.3-1.1" />
            <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" />
            <path d="M7.8 10.5V7.2a4.2 4.2 0 0 1 8.4 0v3.3" />
        </>
    ),
    send: (
        <>
            <path d="M21 3.5 10.8 13.8" />
            <path d="m21 3.5-6.6 17-3.6-6.7L4 10.2Z" />
        </>
    ),
    archive: (
        <>
            <rect x="2.5" y="3.5" width="19" height="4.6" rx="1.6" />
            <path d="M4.5 8.1v10.4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.1" />
            <path d="M10 12.5h4" />
        </>
    ),
    reply: (
        <>
            <path d="M9 13.5 4 8.5l5-5" />
            <path d="M4 8.5h9.5a7 7 0 0 1 7 7v4.5" />
        </>
    ),
    filter: <path d="M3.5 5h17l-6.6 7.6V19l-3.8 2v-8.4Z" />,
    tag: (
        <>
            <path d="M20.4 13.4 13 20.8a2 2 0 0 1-2.8 0L3.2 13.8V3.5h10.3l6.9 6.9a2 2 0 0 1 0 3Z" />
            <path d="M7.6 7.6h.01" />
        </>
    ),
    image: (
        <>
            <rect x="3.2" y="3.5" width="17.6" height="17" rx="2.4" />
            <circle cx="9.2" cy="9.2" r="1.8" />
            <path d="m20.8 15.5-4.6-4.6-9.4 9.6" />
        </>
    ),
    link: (
        <>
            <path d="M10.3 13.4a4.6 4.6 0 0 0 6.9.5l2.8-2.8a4.6 4.6 0 0 0-6.5-6.5l-1.6 1.6" />
            <path d="M13.7 10.6a4.6 4.6 0 0 0-6.9-.5L4 12.9a4.6 4.6 0 0 0 6.5 6.5l1.6-1.6" />
        </>
    ),
    inbox: (
        <>
            <path d="M21.5 12.5h-5.3l-1.8 2.8H9.6l-1.8-2.8H2.5" />
            <path d="M5.6 4.5h12.8l3.1 8v6.5a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2v-6.5Z" />
        </>
    ),
    calendar: (
        <>
            <rect x="3.2" y="4.8" width="17.6" height="16.2" rx="2.2" />
            <path d="M16 2.8v3.8M8 2.8v3.8M3.2 10.6h17.6" />
        </>
    ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICONS

type IconComponentProps = IconProps & { name: IconName }

const Icon = ({ name, ...props }: IconComponentProps) => (
    <IconBase {...props}>{ICONS[name]}</IconBase>
)

/** Indeterminate progress ring used by buttons while a request is in flight. */
const Spinner = ({ size = 16, className = "", ...props }: IconProps) => (
    <svg
        className={`admin-spin ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        {...props}
    >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
        <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
    </svg>
)

export { Icon, IconBase, Spinner }
export default Icon


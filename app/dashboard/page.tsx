"use client"

import Link from "next/link"
import useSWR from "swr"
import { SectionCard, StatCard } from "@/components/ui/Cards"
import PageHeader from "@/components/ui/PageHeader"
import Badge from "@/components/ui/Badge"
import { LinkButton } from "@/components/ui/Button"
import { TableSkeleton, StatSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import { Icon } from "@/components/ui/Icons"
import { formatRelative, initials, truncate } from "@/lib/format"
import type { DashboardSummary } from "@/types"

const QUICK_LINKS = [
    { href: "/dashboard/projects", label: "New project", icon: "folder" },
    { href: "/dashboard/experience", label: "Add experience", icon: "briefcase" },
    { href: "/dashboard/profile", label: "Edit profile", icon: "user" },
    { href: "/dashboard/messages", label: "Open inbox", icon: "mail" },
] as const

const LIST_ITEM_STYLE: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.85rem clamp(1rem, 2vw, 1.4rem)",
    borderBottom: "1px solid var(--border-subtle)",
    color: "inherit",
    textDecoration: "none",
}

const UNLIST: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 }

const DashboardPage = () => {
    const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(["dashboard/summary"])

    const stats = data?.stats
    const recentMessages = data?.recentMessages ?? []
    const latestProjects = data?.latestProjects ?? []

    return (
        <>
            <PageHeader
                eyebrow="Overview"
                title="Dashboard"
                description="A quick look at what is live on the portfolio and what needs your attention."
                actions={
                    <LinkButton href="/dashboard/projects" icon="plus" size="sm">
                        New project
                    </LinkButton>
                }
            />

            {error ? (
                <div className="admin-alert admin-alert--danger">
                    <Icon name="alert" size={16} />
                    <div className="flex-1">
                        <p className="admin-toast__title">Could not load the dashboard</p>
                        <p className="admin-toast__text">{error.message}</p>
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => mutate()}
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            {isLoading && !stats ? (
                <StatSkeleton />
            ) : stats ? (
                <div className="admin-grid admin-grid--stats">
                    <StatCard
                        label="Projects"
                        value={stats.projects}
                        icon="folder"
                        foot={`${stats.publishedProjects} live · ${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`}
                    />
                    <StatCard
                        label="Unread messages"
                        value={stats.unreadMessages}
                        icon="mail"
                        foot={`${stats.messages} total · ${stats.starredMessages} starred`}
                    />
                    <StatCard
                        label="Work experience"
                        value={stats.experiences}
                        icon="briefcase"
                        foot="Roles shown on the timeline"
                    />
                    <StatCard
                        label="About blocks"
                        value={stats.aboutBlocks}
                        icon="layers"
                        foot={`${stats.techStacks} stack group${stats.techStacks === 1 ? "" : "s"}`}
                    />
                </div>
            ) : null}

            <div className="admin-grid admin-grid--split" style={{ marginTop: "1.1rem" }}>
                <SectionCard
                    title="Latest messages"
                    hint="The five most recent notes from the contact form"
                    actions={
                        <Link href="/dashboard/messages" className="admin-btn admin-btn--ghost admin-btn--sm">
                            Open inbox
                        </Link>
                    }
                    bare
                >
                    {isLoading && !data ? (
                        <TableSkeleton rows={4} />
                    ) : recentMessages.length === 0 ? (
                        <EmptyState
                            icon="inbox"
                            title="No messages yet"
                            description="Submissions from the portfolio contact form will appear here."
                        />
                    ) : (
                        <ul style={UNLIST}>
                            {recentMessages.map(message => (
                                <li key={message._id}>
                                    <Link href={`/dashboard/messages?open=${message._id}`} style={LIST_ITEM_STYLE}>
                                        <span className="admin-avatar">{initials(message.name)}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="admin-cell__title truncate">
                                                {message.subject || "(no subject)"}
                                            </span>
                                            <span className="admin-cell__sub truncate">
                                                {message.name} · {truncate(message.message, 90)}
                                            </span>
                                        </span>
                                        <span className="admin-row" style={{ gap: "0.4rem" }}>
                                            {message.status === "new" ? (
                                                <Badge tone="primary">New</Badge>
                                            ) : null}
                                            <span className="admin-muted" style={{ fontSize: "0.72rem" }}>
                                                {formatRelative(message.createdAt)}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <div className="admin-stack">
                    <SectionCard title="Recently updated projects" bare>
                        {isLoading && !data ? (
                            <TableSkeleton rows={3} />
                        ) : latestProjects.length === 0 ? (
                            <EmptyState
                                icon="folder"
                                title="No projects yet"
                                description="Create your first project to populate the portfolio grid."
                            />
                        ) : (
                            <ul style={UNLIST}>
                                {latestProjects.map(project => (
                                    <li key={project._id}>
                                        <Link
                                            href={`/dashboard/projects?edit=${project._id}`}
                                            style={LIST_ITEM_STYLE}
                                        >
                                            {project.thumbnail ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    className="admin-thumb"
                                                    src={project.thumbnail}
                                                    alt=""
                                                    style={{ width: 38, height: 38 }}
                                                />
                                            ) : (
                                                <span className="admin-thumb admin-thumb--placeholder">
                                                    <Icon name="image" size={16} />
                                                </span>
                                            )}
                                            <span className="min-w-0 flex-1">
                                                <span className="admin-cell__title truncate">
                                                    {project.name}
                                                </span>
                                                <span className="admin-cell__sub truncate">
                                                    updated {formatRelative(project.updatedAt)}
                                                </span>
                                            </span>
                                            {project.isPublished ? (
                                                <Badge tone="success">Live</Badge>
                                            ) : (
                                                <Badge tone="warning">Draft</Badge>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>

                    <SectionCard title="Quick actions">
                        <div className="admin-row" style={{ gap: "0.5rem" }}>
                            {QUICK_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="admin-btn admin-btn--soft admin-btn--sm"
                                >
                                    <Icon name={link.icon} size={15} />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </SectionCard>
                </div>

            </div>
        </>
    )
}

export default DashboardPage

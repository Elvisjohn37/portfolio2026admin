"use client"

import { useState } from "react"
import useSWR from "swr"
import cls from "classnames"
import useList from "@/lib/use-list"
import api from "@/lib/api"
import { formatDateTime, formatRelative, initials, truncate } from "@/lib/format"
import { MESSAGE_STATUSES } from "@/lib/constants"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import { SearchInput, FilterChips } from "@/components/ui/Filters"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Icon } from "@/components/ui/Icons"
import { useToast } from "@/components/providers/toast-provider"
import type { ContactMessage, MessageStats, MessageStatus } from "@/types"

const toneOf = (status: MessageStatus) =>
    (MESSAGE_STATUSES.find(item => item.value === status)?.tone ?? "neutral") as
        | "neutral"
        | "success"
        | "warning"
        | "danger"
        | "info"
        | "primary"

/** Every write goes through here: the API validates `status` + `starred` together. */
const patchMessage = async (message: ContactMessage, patch: Partial<ContactMessage>) =>
    api.put<{ message: ContactMessage }>(`messages/${message._id}`, {
        status: patch.status ?? message.status,
        starred: patch.starred ?? message.starred,
    })

const Row = ({
    message,
    onOpen,
    onToggleStar,
}: {
    message: ContactMessage
    onOpen: () => void
    onToggleStar: () => void
}) => (
    <tr
        onClick={onOpen}
        style={{ cursor: "pointer" }}
        className={cls(message.status === "new" && "font-semibold")}
    >
        <td style={{ width: 44 }}>
            <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--icon"
                aria-label={message.starred ? "Remove star" : "Star message"}
                title={message.starred ? "Remove star" : "Star message"}
                style={{ color: message.starred ? "var(--warning)" : undefined }}
                onClick={event => {
                    event.stopPropagation()
                    onToggleStar()
                }}
            >
                <Icon name="star" size={16} />
            </button>
        </td>
        <td>
            <div className="admin-row" style={{ gap: "0.75rem" }}>
                <span className="admin-avatar">{initials(message.name)}</span>
                <div className="min-w-0">
                    <p className="admin-cell__title truncate">{message.name}</p>
                    <p className="admin-cell__sub truncate">{message.email}</p>
                </div>
            </div>
        </td>
        <td>
            <p className="admin-cell__title truncate">{message.subject || "(no subject)"}</p>
            <p className="admin-cell__sub truncate">{truncate(message.message, 90)}</p>
        </td>
        <td>
            <Badge tone={toneOf(message.status)}>{message.status}</Badge>
        </td>
        <td className="whitespace-nowrap" title={formatDateTime(message.createdAt)}>
            <span className="admin-cell__sub" style={{ marginTop: 0 }}>
                {formatRelative(message.createdAt)}
            </span>
        </td>
    </tr>
)

/** Reading pane: full body plus the status / star actions and a mailto reply. */
const MessageDetail = ({
    message,
    onClose,
    onChanged,
    onDelete,
}: {
    message: ContactMessage | null
    onClose: () => void
    onChanged: (message: ContactMessage) => void
    onDelete: (message: ContactMessage) => void
}) => {
    const toast = useToast()
    const [busy, setBusy] = useState(false)

    const update = async (patch: Partial<ContactMessage>, success: string) => {
        if (!message) return

        setBusy(true)

        try {
            const result = await patchMessage(message, patch)

            onChanged(result.message)
            toast.success(success, message.name)
        } catch {
            toast.error("Could not update the message")
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal
            open={Boolean(message)}
            size="wide"
            title={message?.subject || "(no subject)"}
            description={
                message
                    ? `${message.name} · ${message.email} · ${formatDateTime(message.createdAt)}`
                    : undefined
            }
            onClose={onClose}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={busy}
                        style={{ marginRight: "auto" }}
                    >
                        Close
                    </Button>
                    {message?.starred ? (
                        <Button
                            variant="soft"
                            icon="star"
                            disabled={busy}
                            onClick={() => void update({ starred: false }, "Star removed")}
                        >
                            Unstar
                        </Button>
                    ) : (
                        <Button
                            variant="soft"
                            icon="star"
                            disabled={busy}
                            onClick={() => void update({ starred: true }, "Starred")}
                        >
                            Star
                        </Button>
                    )}
                    <a
                        className="admin-btn admin-btn--soft"
                        href={`mailto:${message?.email}?subject=${encodeURIComponent(
                            `Re: ${message?.subject ?? ""}`,
                        )}`}
                    >
                        <Icon name="reply" size={16} />
                        Reply by email
                    </a>
                    {message ? (
                        <Button variant="danger" icon="trash" onClick={() => onDelete(message)}>
                            Delete
                        </Button>
                    ) : null}
                </>
            }
        >
            {message ? (
                <>
                    <div className="admin-row" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
                        <Badge tone={toneOf(message.status)}>{message.status}</Badge>
                        {message.source ? <Badge tone="neutral">{message.source}</Badge> : null}
                        {message.repliedAt ? (
                            <Badge tone="success" icon="check">
                                replied {formatRelative(message.repliedAt)}
                            </Badge>
                        ) : null}

                        <span className="admin-row" style={{ gap: "0.4rem", marginLeft: "auto" }}>
                            {MESSAGE_STATUSES.filter(item => item.value !== message.status).map(item => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className="admin-chip"
                                    disabled={busy}
                                    onClick={() =>
                                        void update(
                                            { status: item.value as MessageStatus },
                                            `Marked as ${item.label.toLowerCase()}`,
                                        )
                                    }
                                >
                                    Mark {item.label.toLowerCase()}
                                </button>
                            ))}
                        </span>
                    </div>

                    <p
                        style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.7,
                            fontSize: "0.9375rem",
                        }}
                    >
                        {message.message}
                    </p>
                </>
            ) : null}
        </Modal>
    )
}

const MessagesView = () => {
    const list = useList<ContactMessage>({
        path: "messages",
        listKey: "messages",
        sort: "-createdAt",
        filters: { status: "all", starred: "all" },
    })

    const { data: stats } = useSWR<MessageStats>(["messages/stats"])
    const [selected, setSelected] = useState<ContactMessage | null>(null)
    const [deleting, setDeleting] = useState<ContactMessage | null>(null)

    const changed = (message: ContactMessage) => {
        setSelected(current => (current && current._id === message._id ? message : current))
        void list.refresh()
    }

    /** Opening a message also moves it out of the unread counter. */
    const open = async (message: ContactMessage) => {
        setSelected(message)

        if (message.status !== "new") return

        try {
            const result = await patchMessage(message, { status: "read" })

            changed(result.message)
        } catch {
            // Reading still works if the patch fails - the badge is cosmetic.
        }
    }

    const toggleStar = async (message: ContactMessage) => {
        try {
            const result = await patchMessage(message, { starred: !message.starred })

            changed(result.message)
        } catch {
            // The row keeps its previous state.
        }
    }

    const statusOptions = [
        { value: "all", label: "All", count: stats?.total },
        ...MESSAGE_STATUSES.map(item => ({
            value: item.value,
            label: item.label,
            count:
                item.value === "new"
                    ? stats?.unread
                    : item.value === "replied"
                      ? stats?.replied
                      : undefined,
        })),
    ]

    return (
        <>
            <PageHeader
                eyebrow="Inbox"
                title="Messages"
                description="Everything that arrived through the portfolio contact form."
                actions={
                    stats ? (
                        <div className="admin-row" style={{ gap: "0.4rem" }}>
                            <Badge tone={stats.unread ? "primary" : "neutral"}>
                                {stats.unread} unread
                            </Badge>
                            <Badge tone="warning" icon="star">
                                {stats.starred} starred
                            </Badge>
                            <Badge tone="success" icon="check">
                                {stats.replied} replied
                            </Badge>
                        </div>
                    ) : null
                }
            />

            <SectionCard bare>
                <div className="admin-section__head" style={{ alignItems: "flex-start" }}>
                    <div className="min-w-0" style={{ flex: 1 }}>
                        <h2 className="admin-section__title">Inbox</h2>
                        <p className="admin-section__hint">
                            Opening a message marks it as read - nothing is deleted by accident.
                        </p>
                        <div style={{ marginTop: "0.75rem" }}>
                            <FilterChips
                                label="Filter by status"
                                value={list.active.status ?? "all"}
                                onChange={value => list.changeFilter("status", value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>
                    <div className="admin-stack" style={{ gap: "0.6rem", minWidth: 220 }}>
                        <SearchInput
                            value={list.search}
                            onChange={list.setSearch}
                            placeholder="Search sender or subject…"
                        />
                        <FilterChips
                            label="Filter by star"
                            value={list.active.starred ?? "all"}
                            onChange={value => list.changeFilter("starred", value)}
                            options={[
                                { value: "all", label: "Any" },
                                { value: "true", label: "Starred", count: stats?.starred },
                                { value: "false", label: "Unstarred" },
                            ]}
                        />
                    </div>
                </div>

                {list.isLoading && list.items.length === 0 ? (
                    <TableSkeleton rows={5} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="mail"
                        title={
                            list.search || list.active.status !== "all"
                                ? "Nothing matches those filters"
                                : "Inbox zero"
                        }
                        description={
                            list.search || list.active.status !== "all"
                                ? "Reset the filters to see the full inbox."
                                : "New messages from the contact form land here."
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th />
                                    <th>From</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(message => (
                                    <Row
                                        key={message._id}
                                        message={message}
                                        onOpen={() => void open(message)}
                                        onToggleStar={() => void toggleStar(message)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    pagination={list.pagination}
                    label="messages"
                    onPageChange={list.setPage}
                />

            </SectionCard>
            <MessageDetail
                message={selected}
                onClose={() => setSelected(null)}
                onChanged={changed}
                onDelete={message => setDeleting(message)}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete message"
                description={
                    deleting
                        ? `The message from ${deleting.name} will be deleted permanently.`
                        : ""
                }
                itemLabel="Message"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return

                    await api.delete(`messages/${deleting._id}`)
                    setSelected(null)
                    void list.refresh()
                }}
            />

        </>
    )
}

export default MessagesView


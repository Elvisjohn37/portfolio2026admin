"use client"

import { useState } from "react"
import useList from "@/lib/use-list"
import api from "@/lib/api"
import { formatRelative } from "@/lib/format"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import { Button } from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { SearchInput } from "@/components/ui/Filters"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import RowActions from "@/components/ui/RowActions"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Icon } from "@/components/ui/Icons"
import ExperienceFormModal from "@/components/experience/ExperienceFormModal"
import type { WorkExperience } from "@/types"

/** The list only answers with populated projects - the API wants plain ids. */
const toProjectIds = (projects: WorkExperience["projects"]) =>
    (projects ?? []).map(item => (typeof item === "string" ? item : item._id))

const Row = ({
    experience,
    busy,
    onEdit,
    onDelete,
    onToggle,
}: {
    experience: WorkExperience
    busy: boolean
    onEdit: () => void
    onDelete: () => void
    onToggle: () => void
}) => {
    const linked = experience.projects ?? []

    return (
        <tr>
            <td>
                <div className="admin-row" style={{ gap: "0.75rem" }}>
                    <span className="admin-thumb admin-thumb--placeholder">
                        <Icon name="briefcase" size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="admin-cell__title truncate">{experience.title}</p>
                        <p className="admin-cell__sub truncate">{experience.company}</p>
                    </div>
                </div>
            </td>
            <td>
                <p className="admin-cell__title">{experience.start}</p>
                <p className="admin-cell__sub truncate">
                    {experience.current ? "Present" : experience.endDate || experience.end || "-"}
                </p>
            </td>
            <td>
                <div className="admin-row" style={{ gap: "0.4rem", flexWrap: "wrap" }}>
                    {experience.current ? <Badge tone="primary">Current</Badge> : null}
                    {linked.length ? (
                        <Badge tone="info" title={linked.map(item => typeof item === "string" ? item : item.name).join(", ")}>
                            {linked.length} project{linked.length === 1 ? "" : "s"}
                        </Badge>
                    ) : null}
                    {experience.skills?.length ? (
                        <Badge tone="neutral">{experience.skills.length} skills</Badge>
                    ) : null}
                </div>
            </td>
            <td>
                {experience.isPublished ? (
                    <Badge tone="success" icon="check" title="Live on the portfolio">
                        Published
                    </Badge>
                ) : (
                    <Badge tone="warning" title="Hidden from the public timeline">
                        Draft
                    </Badge>
                )}
            </td>
            <td className="admin-cell__sub whitespace-nowrap" title={experience.updatedAt}>
                {formatRelative(experience.updatedAt)}
            </td>
            <td>
                <RowActions
                    busy={busy}
                    editLabel={`Edit ${experience.title}`}
                    deleteLabel={`Delete ${experience.title}`}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    extra={{
                        icon: experience.isPublished ? "eyeOff" : "eye",
                        label: experience.isPublished ? "Unpublish" : "Publish",
                        loading: busy,
                        onClick: onToggle,
                    }}
                />
            </td>
        </tr>
    )
}

const ExperienceView = () => {
    const list = useList<WorkExperience>({
        path: "work-experiences/manage",
        listKey: "experiences",
        sort: "order",
    })

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<WorkExperience | null>(null)
    const [deleting, setDeleting] = useState<WorkExperience | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    const openNew = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const openEdit = (experience: WorkExperience) => {
        setEditing(experience)
        setFormOpen(true)
    }

    /**
     * The PUT endpoint validates the whole document, so the payload is rebuilt
     * from the row and only `isPublished` changes.
     */
    const togglePublished = async (experience: WorkExperience) => {
        setBusyId(experience._id)

        try {
            await api.put(`work-experiences/${experience._id}`, {
                title: experience.title,
                company: experience.company,
                start: experience.start,
                startDate: experience.startDate,
                end: experience.end,
                endDate: experience.endDate,
                focus: experience.focus,
                highlights: experience.highlights ?? [],
                skills: experience.skills ?? [],
                projects: toProjectIds(experience.projects),
                isPublished: !experience.isPublished,
                order: experience.order,
            })

            await list.refresh()
        } finally {
            setBusyId(null)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Work experience"
                description="The timeline of roles shown on the portfolio."
                actions={
                    <Button icon="plus" size="sm" onClick={openNew}>
                        New experience
                    </Button>
                }
            />

            <SectionCard bare>
                <div className="admin-section__head" style={{ alignItems: "flex-start" }}>
                    <div className="min-w-0" style={{ flex: 1 }}>
                        <h2 className="admin-section__title">Roles</h2>
                        <p className="admin-section__hint">
                            Sorted by the order field - blank end date marks the current role.
                        </p>
                    </div>
                    <SearchInput
                        value={list.search}
                        onChange={list.setSearch}
                        placeholder="Search roles or companies…"
                    />
                </div>

                {list.isLoading && list.items.length === 0 ? (
                    <TableSkeleton rows={4} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="briefcase"
                        title={list.search ? "No matching roles" : "No experience yet"}
                        description={
                            list.search
                                ? "Try a different title or company."
                                : "Add the first role to start the timeline."
                        }
                        action={
                            list.search ? null : (
                                <Button icon="plus" size="sm" onClick={openNew}>
                                    Add experience
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Period</th>
                                    <th>Tags</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(experience => (
                                    <Row
                                        key={experience._id}
                                        experience={experience}
                                        busy={busyId === experience._id}
                                        onEdit={() => openEdit(experience)}
                                        onDelete={() => setDeleting(experience)}
                                        onToggle={() => void togglePublished(experience)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    pagination={list.pagination}
                    label="roles"
                    onPageChange={list.setPage}
                />

            </SectionCard>
            <ExperienceFormModal
                open={formOpen}
                experience={editing}
                onClose={() => setFormOpen(false)}
                onSaved={() => void list.refresh()}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete experience"
                description={
                    deleting
                        ? `“${deleting.title}” at ${deleting.company} will be removed from the timeline.`
                        : ""
                }
                itemLabel="Experience"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return
                    await api.delete(`work-experiences/${deleting._id}`)
                    void list.refresh()
                }}
            />

        </>
    )
}

export default ExperienceView


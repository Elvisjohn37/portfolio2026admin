"use client"
import { mediaUrl } from "@/lib/portfolio-url"

import { useCallback, useEffect, useState } from "react"
import useList from "@/lib/use-list"
import api from "@/lib/api"
import { useToast } from "@/components/providers/toast-provider"
import PageHeader from "@/components/ui/PageHeader"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { SectionCard } from "@/components/ui/Cards"
import { SearchInput, FilterChips } from "@/components/ui/Filters"
import Pagination from "@/components/ui/Pagination"
import EmptyState from "@/components/ui/EmptyState"
import { TableSkeleton } from "@/components/ui/Skeletons"
import RowActions from "@/components/ui/RowActions"
import ConfirmModal from "@/components/ui/ConfirmModal"
import { Icon } from "@/components/ui/Icons"
import { formatRelative, truncate } from "@/lib/format"
import ProjectFormModal from "@/components/projects/ProjectFormModal"
import type { Project } from "@/types"

const PUBLISHED_FILTERS = [
    { value: "all", label: "All" },
    { value: "true", label: "Published" },
    { value: "false", label: "Drafts" },
]

const stackSummary = (project: Project) => {
    const all = [
        ...(project.techStacks?.frontend ?? []),
        ...(project.techStacks?.backend ?? []),
        ...(project.techStacks?.tools ?? []),
    ]

    return all.length ? truncate(all.join(" · "), 58) : "No stack listed"
}

/** Only the editable fields - the API validates the rest. */
const toPayload = (project: Project, changes: Partial<Project> = {}) => ({
    name: project.name,
    description: project.description,
    info: project.info,
    logoSrc: project.logoSrc,
    thumbnail: project.thumbnail,
    images: project.images,
    url: project.url,
    techStacks: project.techStacks,
    featured: project.featured,
    isPublished: project.isPublished,
    order: project.order,
    ...changes,
})

const ProjectsView = ({ editId }: { editId?: string }) => {
    const toast = useToast()
    const list = useList<Project>({
        path: "projects/manage",
        listKey: "projects",
        sort: "order",
        filters: { published: "all" },
    })

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Project | null>(null)
    const [deleting, setDeleting] = useState<Project | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)

    // `/dashboard/projects?edit=<id>` (linked from the dashboard) opens the row.
    useEffect(() => {
        if (!editId) return

        api
            .get<{ project: Project }>(`projects/${editId}`)
            .then(payload => {
                setEditing(payload.project)
                setFormOpen(true)
            })
            .catch((error: Error) => toast.error("Could not open that project", error.message))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId])

    const openNew = useCallback(() => {
        setEditing(null)
        setFormOpen(true)
    }, [])

    const openEdit = useCallback((project: Project) => {
        setEditing(project)
        setFormOpen(true)
    }, [])

    const togglePublished = async (project: Project) => {
        setApiError(null)

        try {
            await api.put(
                `projects/${project._id}`,
                toPayload(project, { isPublished: !project.isPublished }),
            )

            toast.success(
                project.isPublished ? "Moved to drafts" : "Published",
                `${project.name} is ${project.isPublished ? "hidden from" : "live on"} the site`,
            )
            list.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Please try again"

            setApiError(message)
            toast.error("Update failed", message)
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Projects"
                description="Everything shown in the work grid. Drafts stay private until you publish them."
                actions={
                    <Button icon="plus" onClick={openNew}>
                        New project
                    </Button>
                }
            />

            {apiError ? (
                <div className="admin-alert admin-alert--danger" style={{ marginBottom: "1rem" }}>
                    <Icon name="alert" size={16} />
                    <span>{apiError}</span>
                </div>
            ) : null}

            <SectionCard bare>
                <div className="admin-toolbar">
                    <SearchInput
                        value={list.search}
                        onChange={list.setSearch}
                        placeholder="Search name, description or info…"
                    />
                    <FilterChips
                        label="Publication status"
                        value={list.active.published}
                        options={PUBLISHED_FILTERS}
                        onChange={value => list.changeFilter("published", value)}
                    />
                </div>

                {list.isLoading ? (
                    <TableSkeleton rows={5} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="folder"
                        title={list.search ? "No matching projects" : "No projects yet"}
                        description={
                            list.search
                                ? "Try a different search term or clear the filters."
                                : "Add your first project and it will show up in the portfolio grid."
                        }
                        action={
                            list.search ? (
                                <Button variant="soft" size="sm" onClick={() => list.setSearch("")}>
                                    Clear search
                                </Button>
                            ) : (
                                <Button icon="plus" size="sm" onClick={openNew}>
                                    New project
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Stack</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(project => (
                                    <tr key={project._id}>
                                        <td>
                                            <div className="admin-cell">
                                                {project.thumbnail ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        className="admin-thumb"
                                                        src={mediaUrl(project.thumbnail)}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <span className="admin-thumb admin-thumb--placeholder">
                                                        <Icon name="image" size={16} />
                                                    </span>
                                                )}
                                                <span className="min-w-0">
                                                    <span className="admin-cell__title truncate">
                                                        {project.name}
                                                    </span>
                                                    <span className="admin-cell__sub truncate">
                                                        /{project.slug}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-cell__sub" style={{ margin: 0 }}>
                                                {stackSummary(project)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-row" style={{ gap: "0.3rem" }}>
                                                {project.isPublished ? (
                                                    <Badge tone="success">Live</Badge>
                                                ) : (
                                                    <Badge tone="warning">Draft</Badge>
                                                )}
                                                {project.featured ? (
                                                    <Badge tone="primary" icon="star">
                                                        Featured
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="admin-muted" style={{ fontSize: "0.78rem" }}>
                                            {formatRelative(project.updatedAt)}
                                        </td>
                                        <td>
                                            <RowActions
                                                onEdit={() => openEdit(project)}
                                                onDelete={() => setDeleting(project)}
                                                editLabel={`Edit ${project.name}`}
                                                deleteLabel={`Delete ${project.name}`}
                                                extra={{
                                                    icon: project.isPublished ? "eyeOff" : "check",
                                                    label: project.isPublished
                                                        ? "Move to drafts"
                                                        : "Publish now",
                                                    onClick: () => void togglePublished(project),
                                                }}
                                            />
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                <Pagination
                    pagination={list.pagination}
                    label="projects"
                    onPageChange={list.setPage}
                />

            </SectionCard>

            <ProjectFormModal
                open={formOpen}
                project={editing}
                onClose={() => setFormOpen(false)}
                onSaved={() => void list.refresh()}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete project"
                description={
                    deleting
                        ? `“${deleting.name}” will be removed from the portfolio.`
                        : ""
                }
                itemLabel="Project"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return
                    await api.delete(`projects/${deleting._id}`)
                    void list.refresh()
                }}
            />

        </>
    )
}

export default ProjectsView

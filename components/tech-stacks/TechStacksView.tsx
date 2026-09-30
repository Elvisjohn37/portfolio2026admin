"use client"

import { useEffect, useState } from "react"
import useList from "@/lib/use-list"
import api from "@/lib/api"
import { formatDate } from "@/lib/format"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import { Field, FormAlert, TextInput } from "@/components/ui/Field"
import { SearchInput } from "@/components/ui/Filters"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import RowActions from "@/components/ui/RowActions"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import useForm from "@/lib/forms/use-form"
import { useToast } from "@/components/providers/toast-provider"
import { techStackSchema, type TechStackValues } from "@/lib/validation/schemas"
import type { TechStackGroup } from "@/types"

const EMPTY: TechStackValues = { techStack: "", order: 0 }

/** Small create/edit dialog - a stack group is only a name plus an order. */
const StackFormModal = ({
    open,
    stack,
    onClose,
    onSaved,
}: {
    open: boolean
    stack: TechStackGroup | null
    onClose: () => void
    onSaved: () => void
}) => {
    const toast = useToast()
    const initialValues: TechStackValues = stack
        ? { techStack: stack.techStack, order: stack.order ?? 0 }
        : EMPTY

    const form = useForm<TechStackValues>({
        initialValues,
        validationSchema: techStackSchema,
        onSubmit: async values => {
            if (stack) {
                await api.put(`tech-stacks/${stack._id}`, values)
            } else {
                await api.post("tech-stacks", values)
            }

            toast.success(stack ? "Stack group updated" : "Stack group created", values.techStack)
            form.reset()
            onSaved()
            onClose()
        },
    })

    useEffect(() => {
        form.reset(initialValues)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stack, open])

    return (
        <Modal
            open={open}
            title={stack ? `Rename ${stack.techStack}` : "New stack group"}
            description="Groups power the About section tabs (Frontend, Backend, Tools…)."
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={form.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" icon="check" form="stack-form" loading={form.isSubmitting}>
                        {stack ? "Save changes" : "Create group"}
                    </Button>
                </>
            }
        >
            <FormAlert message={form.errors.form} />

            <form id="stack-form" onSubmit={form.handleSubmit} className="admin-form">
                <Field label="Group name" htmlFor="techStack" required error={form.errors.techStack}>
                    <TextInput
                        id="techStack"
                        value={form.values.techStack}
                        placeholder="Frontend"
                        invalid={Boolean(form.errors.techStack)}
                        onChange={event => form.setValue("techStack", event.target.value)}
                    />
                </Field>

                <Field label="Display order" htmlFor="stack-order" error={form.errors.order}>
                    <TextInput
                        id="stack-order"
                        type="number"
                        min={0}
                        value={form.values.order}
                        invalid={Boolean(form.errors.order)}
                        onChange={event => form.setValue("order", Number(event.target.value) || 0)}
                    />
                </Field>
            </form>
        </Modal>
    )
}

const TechStacksView = () => {
    const list = useList<TechStackGroup>({
        path: "tech-stacks/all",
        listKey: "techStacks",
        sort: "order",
    })

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<TechStackGroup | null>(null)
    const [deleting, setDeleting] = useState<TechStackGroup | null>(null)

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Stack groups"
                description="The categories every About block belongs to."
                actions={
                    <Button
                        icon="plus"
                        size="sm"
                        onClick={() => {
                            setEditing(null)
                            setFormOpen(true)
                        }}
                    >
                        New group
                    </Button>
                }
            />

            <SectionCard bare>
                <div className="admin-section__head" style={{ alignItems: "flex-start" }}>
                    <div className="min-w-0" style={{ flex: 1 }}>
                        <h2 className="admin-section__title">Groups</h2>
                        <p className="admin-section__hint">
                            A group can only be deleted once no About block uses it.
                        </p>
                    </div>
                    <SearchInput
                        value={list.search}
                        onChange={list.setSearch}
                        placeholder="Search groups…"
                    />
                </div>

                {list.isLoading && list.items.length === 0 ? (
                    <TableSkeleton rows={4} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="database"
                        title={list.search ? "No matching groups" : "No stack groups"}
                        description={
                            list.search
                                ? "Try another name."
                                : "Create the first group so About blocks can be categorised."
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Group</th>
                                    <th>Blocks</th>
                                    <th>Order</th>
                                    <th>Created</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(stack => (
                                    <tr key={stack._id}>
                                        <td>
                                            <p className="admin-cell__title">{stack.techStack}</p>
                                        </td>
                                        <td>
                                            <Badge
                                                tone={stack.usageCount ? "info" : "neutral"}
                                                title="About blocks using this group"
                                            >
                                                {stack.usageCount ?? 0}
                                            </Badge>
                                        </td>
                                        <td className="admin-cell__sub">{stack.order}</td>
                                        <td className="admin-cell__sub whitespace-nowrap">
                                            {formatDate(stack.createdAt)}
                                        </td>
                                        <td>
                                            <RowActions
                                                editLabel={`Edit ${stack.techStack}`}
                                                deleteLabel={`Delete ${stack.techStack}`}
                                                onEdit={() => {
                                                    setEditing(stack)
                                                    setFormOpen(true)
                                                }}
                                                onDelete={() => setDeleting(stack)}
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
                    label="groups"
                    onPageChange={list.setPage}
                />
            </SectionCard>

            <StackFormModal
                open={formOpen}
                stack={editing}
                onClose={() => setFormOpen(false)}
                onSaved={() => void list.refresh()}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete stack group"
                description={
                    deleting
                        ? `“${deleting.techStack}” will be removed. Blocks that use it must be moved first.`
                        : ""
                }
                itemLabel="Stack group"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return
                    await api.delete(`tech-stacks/${deleting._id}`)
                    void list.refresh()
                }}
            />
        </>
    )
}

export default TechStacksView


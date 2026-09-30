"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import useList from "@/lib/use-list"
import api from "@/lib/api"
import { formatRelative, truncate } from "@/lib/format"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import { Field, FormAlert, Select, TextInput } from "@/components/ui/Field"
import { SearchInput, FilterChips } from "@/components/ui/Filters"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import RowActions from "@/components/ui/RowActions"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import useForm from "@/lib/forms/use-form"
import { useToast } from "@/components/providers/toast-provider"
import { aboutBlockSchema, type AboutBlockValues } from "@/lib/validation/schemas"
import type { AboutBlock, AboutProfile, TechStackGroup } from "@/types"

type StackOption = Pick<TechStackGroup, "_id" | "techStack">

const EMPTY: AboutBlockValues = {
    name: "",
    description: "",
    about: "",
    techStack: "",
    order: 0,
    isPublished: true,
}

const idOf = (value: { _id: string } | string | undefined) =>
    !value ? "" : typeof value === "string" ? value : value._id

/** Populated references come back as objects, but can also be bare ids. */
const nameOf = (value: unknown, fallback = "—") => {
    if (!value) return fallback
    if (typeof value === "string") return value

    const doc = value as { firstName?: string; lastName?: string; techStack?: string }

    return [doc.firstName, doc.lastName].filter(Boolean).join(" ") || doc.techStack || fallback
}

/** Create/edit dialog: a short blurb tied to a profile and a stack group. */
const BlockFormModal = ({
    open,
    block,
    profiles,
    stacks,
    defaultProfile,
    onClose,
    onSaved,
}: {
    open: boolean
    block: AboutBlock | null
    profiles: AboutProfile[]
    stacks: StackOption[]
    defaultProfile: string
    onClose: () => void
    onSaved: () => void
}) => {
    const toast = useToast()
    const initialValues: AboutBlockValues = block
        ? {
            name: block.name ?? "",
            description: block.description ?? "",
            about: idOf(block.about) || defaultProfile,
            techStack: idOf(block.techStack),
            order: block.order ?? 0,
            isPublished: block.isPublished ?? true,
        }
        : { ...EMPTY, about: defaultProfile }

    const form = useForm<AboutBlockValues>({
        initialValues,
        validationSchema: aboutBlockSchema,
        onSubmit: async values => {
            if (block) {
                await api.put(`about-tech-stacks/${block._id}`, values)
            } else {
                await api.post("about-tech-stacks", values)
            }

            toast.success(block ? "Block updated" : "Block created", values.name)
            form.reset()
            onSaved()
            onClose()
        },
    })

    useEffect(() => {
        form.reset(initialValues)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block, open, defaultProfile])

    return (
        <Modal
            open={open}
            title={block ? `Edit “${block.name}”` : "New About block"}
            description="Each block appears under its stack group tab on the About page."
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={form.isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        icon="check"
                        form="block-form"
                        loading={form.isSubmitting}
                    >
                        {block ? "Save changes" : "Create block"}
                    </Button>
                </>
            }
        >
            <FormAlert message={form.errors.form} />

            <form id="block-form" onSubmit={form.handleSubmit} className="admin-form">
                <Field label="Title" htmlFor="name" required error={form.errors.name}>
                    <TextInput
                        id="name"
                        value={form.values.name}
                        placeholder="TypeScript"
                        invalid={Boolean(form.errors.name)}
                        onChange={event => form.setValue("name", event.target.value)}
                    />
                </Field>

                <Field label="Stack group" htmlFor="block-stack" required error={form.errors.techStack}>
                    <Select
                        id="block-stack"
                        placeholder="Choose a group…"
                        options={stacks.map(stack => ({
                            value: stack._id,
                            label: stack.techStack,
                        }))}
                        value={form.values.techStack}
                        invalid={Boolean(form.errors.techStack)}
                        onChange={event => form.setValue("techStack", event.target.value)}
                    />
                </Field>

                <Field
                    label="Description"
                    htmlFor="description"
                    required
                    error={form.errors.description}
                    className="admin-span-all"
                >
                    <TextInput
                        id="description"
                        value={form.values.description}
                        placeholder="Why you reach for it and what you like about it…"
                        invalid={Boolean(form.errors.description)}
                        onChange={event => form.setValue("description", event.target.value)}
                    />
                </Field>

                {profiles.length > 1 ? (
                    <Field label="Profile" htmlFor="block-profile" error={form.errors.about}>
                        <Select
                            id="block-profile"
                            options={profiles.map(profile => ({
                                value: profile._id,
                                label: [profile.firstName, profile.lastName]
                                    .filter(Boolean)
                                    .join(" "),
                            }))}
                            value={form.values.about}
                            invalid={Boolean(form.errors.about)}
                            onChange={event => form.setValue("about", event.target.value)}
                        />
                    </Field>
                ) : null}
            </form>
        </Modal>
    )
}

const AboutBlocksView = () => {
    const list = useList<AboutBlock>({
        path: "about-tech-stacks",
        listKey: "blocks",
        sort: "-createdAt",
        filters: { techStack: "" },
    })

    const { data: profilesData } = useSWR<{ profiles: AboutProfile[] }>(["about"])
    const { data: stacksData } = useSWR<{ techStacks: StackOption[] }>(["tech-stacks/options"])

    const profiles = profilesData?.profiles ?? []
    const stacks = stacksData?.techStacks ?? []
    const defaultProfile = profiles[0]?._id ?? ""

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<AboutBlock | null>(null)
    const [deleting, setDeleting] = useState<AboutBlock | null>(null)

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="About blocks"
                description="The short blurbs grouped by stack on the About page."
                actions={
                    <Button
                        icon="plus"
                        size="sm"
                        onClick={() => {
                            setEditing(null)
                            setFormOpen(true)
                        }}
                    >
                        New block
                    </Button>
                }
            />

            {profiles.length === 0 ? (
                <div className="admin-alert admin-alert--warning">
                    No profile yet - About blocks need a profile to attach to.
                </div>
            ) : null}

            <SectionCard bare>
                <div className="admin-section__head" style={{ alignItems: "flex-start" }}>
                    <div className="min-w-0" style={{ flex: 1 }}>
                        <h2 className="admin-section__title">Blocks</h2>
                        <p className="admin-section__hint">
                            Grouped by the stack group selected on each block.
                        </p>
                        <div style={{ marginTop: "0.75rem" }}>
                            <FilterChips
                                label="Filter by stack group"
                                value={list.active.techStack ?? ""}
                                onChange={value => list.changeFilter("techStack", value)}
                                options={[
                                    { value: "", label: "All groups" },
                                    ...stacks.map(stack => ({
                                        value: stack._id,
                                        label: stack.techStack,
                                    })),
                                ]}
                            />
                        </div>
                    </div>
                    <SearchInput
                        value={list.search}
                        onChange={list.setSearch}
                        placeholder="Search blocks…"
                    />
                </div>

                {list.isLoading && list.items.length === 0 ? (
                    <TableSkeleton rows={5} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="layers"
                        title={list.search ? "No matching blocks" : "No About blocks"}
                        description={
                            list.search
                                ? "Try another keyword."
                                : "Add the first blurb for your favourite tools."
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Block</th>
                                    <th>Group</th>
                                    <th>Profile</th>
                                    <th>Updated</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(block => (
                                    <tr key={block._id}>
                                        <td>
                                            <p className="admin-cell__title truncate">{block.name}</p>
                                            <p className="admin-cell__sub truncate">
                                                {truncate(block.description, 80)}
                                            </p>
                                        </td>
                                        <td>
                                            <Badge tone="primary">{nameOf(block.techStack)}</Badge>
                                        </td>
                                        <td className="admin-cell__sub truncate">
                                            {nameOf(block.about)}
                                        </td>
                                        <td
                                            className="admin-cell__sub whitespace-nowrap"
                                            title={block.updatedAt}
                                        >
                                            {formatRelative(block.updatedAt)}
                                        </td>
                                        <td>
                                            <RowActions
                                                editLabel={`Edit ${block.name}`}
                                                deleteLabel={`Delete ${block.name}`}
                                                onEdit={() => {
                                                    setEditing(block)
                                                    setFormOpen(true)
                                                }}
                                                onDelete={() => setDeleting(block)}
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
                    label="blocks"
                    onPageChange={list.setPage}
                />

            </SectionCard>
            <BlockFormModal
                open={formOpen}
                block={editing}
                profiles={profiles}
                stacks={stacks}
                defaultProfile={defaultProfile}
                onClose={() => setFormOpen(false)}
                onSaved={() => void list.refresh()}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete About block"
                description={
                    deleting ? `“${deleting.name}” will be removed from the About page.` : ""
                }
                itemLabel="About block"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return
                    await api.delete(`about-tech-stacks/${deleting._id}`)
                    void list.refresh()
                }}
            />

        </>
    )
}

export default AboutBlocksView


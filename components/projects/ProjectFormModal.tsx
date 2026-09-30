"use client"

import { useEffect } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { Field, FormAlert, SwitchField, TextInput, Textarea } from "@/components/ui/Field"
import TagInput from "@/components/ui/TagInput"
import useForm from "@/lib/forms/use-form"
import api from "@/lib/api"
import { useToast } from "@/components/providers/toast-provider"
import { projectSchema, type ProjectValues } from "@/lib/validation/schemas"
import { slugify } from "@/lib/format"
import type { Project } from "@/types"

const EMPTY: ProjectValues = {
    name: "",
    description: "",
    info: "",
    logoSrc: "",
    thumbnail: "",
    images: [],
    url: "",
    techStacks: { frontend: [], backend: [], tools: [] },
    featured: true,
    isPublished: true,
    order: 0,
}

const toValues = (project: Project): ProjectValues => ({
    name: project.name ?? "",
    description: project.description ?? "",
    info: project.info ?? "",
    logoSrc: project.logoSrc ?? "",
    thumbnail: project.thumbnail ?? "",
    images: project.images ?? [],
    url: project.url ?? "",
    techStacks: {
        frontend: project.techStacks?.frontend ?? [],
        backend: project.techStacks?.backend ?? [],
        tools: project.techStacks?.tools ?? [],
    },
    featured: project.featured ?? true,
    isPublished: project.isPublished ?? true,
    order: project.order ?? 0,
})

type ProjectFormModalProps = {
    open: boolean
    project: Project | null
    onClose: () => void
    onSaved: () => void
}

const ProjectFormModal = ({ open, project, onClose, onSaved }: ProjectFormModalProps) => {
    const toast = useToast()
    const isEditing = Boolean(project)

    const form = useForm<ProjectValues>({
        initialValues: project ? toValues(project) : EMPTY,
        validationSchema: projectSchema,
        onSubmit: async values => {
            if (project) {
                await api.put(`projects/${project._id}`, values)
            } else {
                await api.post("projects", values)
            }

            toast.success(project ? "Project updated" : "Project created", values.name)
            form.reset()
            onSaved()
            onClose()
        },
    })

    // Reload the draft whenever a different row (or the "new" button) is opened.
    useEffect(() => {
        form.reset(project ? toValues(project) : EMPTY)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, open])

    return (
        <Modal
            open={open}
            size="wide"
            title={isEditing ? `Edit ${project?.name}` : "New project"}
            description={
                isEditing
                    ? `Slug: /${project?.slug} - regenerated from the name when you save`
                    : "The slug is generated from the name automatically"
            }
            onClose={onClose}
            footer={
                <>
                    {form.isDirty ? (
                        <span className="admin-muted" style={{ marginRight: "auto" }}>
                            Unsaved changes
                        </span>
                    ) : null}
                    <Button variant="ghost" onClick={onClose} disabled={form.isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        icon="check"
                        loading={form.isSubmitting}
                        onClick={() => form.handleSubmit()}
                    >
                        {isEditing ? "Save changes" : "Create project"}
                    </Button>
                </>
            }
        >
            <FormAlert message={form.errors.form} />

            <div className="admin-fields">
                <Field label="Project name" htmlFor="name" error={form.errors.name} required>
                    <TextInput
                        id="name"
                        value={form.values.name}
                        invalid={Boolean(form.errors.name)}
                        placeholder="Nimbus Dashboard"
                        onChange={event => form.setValue("name", event.target.value)}
                    />
                </Field>

                <Field
                    label="Live link"
                    htmlFor="url"
                    error={form.errors.url}
                    hint={
                        form.values.name
                            ? `Portfolio URL: /projects/${slugify(form.values.name)}`
                            : "Optional - opens from the project card"
                    }
                >
                    <TextInput
                        id="url"
                        value={form.values.url}
                        invalid={Boolean(form.errors.url)}
                        placeholder="https://nimbus.app"
                        onChange={event => form.setValue("url", event.target.value)}
                    />
                </Field>

                <Field
                    label="Card description"
                    htmlFor="description"
                    error={form.errors.description}
                    hint="One line shown on the project grid (max 140)"
                >
                    <TextInput
                        id="description"
                        value={form.values.description}
                        invalid={Boolean(form.errors.description)}
                        placeholder="Realtime analytics for small teams"
                        onChange={event => form.setValue("description", event.target.value)}
                    />
                </Field>

                <Field label="Logo URL" htmlFor="logoSrc" error={form.errors.logoSrc}>
                    <TextInput
                        id="logoSrc"
                        value={form.values.logoSrc}
                        invalid={Boolean(form.errors.logoSrc)}
                        placeholder="https://…/logo.svg"
                        onChange={event => form.setValue("logoSrc", event.target.value)}
                    />
                </Field>

                <Field
                    label="Thumbnail URL"
                    htmlFor="thumbnail"
                    error={form.errors.thumbnail}
                    className="admin-span-all"
                >
                    <TextInput
                        id="thumbnail"
                        value={form.values.thumbnail}
                        invalid={Boolean(form.errors.thumbnail)}
                        placeholder="https://…/cover.jpg"
                        onChange={event => form.setValue("thumbnail", event.target.value)}
                    />
                </Field>

                <Field
                    label="Gallery images"
                    htmlFor="images"
                    error={form.errors.images}
                    hint="Press Enter after each image URL"
                    className="admin-span-all"
                >
                    <TagInput
                        id="images"
                        value={form.values.images}
                        placeholder="https://…/screenshot.jpg"
                        invalid={Boolean(form.errors.images)}
                        onChange={value => form.setValue("images", value)}
                    />
                </Field>

                <Field
                    label="Detailed info"
                    htmlFor="info"
                    error={form.errors.info}
                    className="admin-span-all"
                >
                    <Textarea
                        id="info"
                        rows={5}
                        value={form.values.info}
                        invalid={Boolean(form.errors.info)}
                        placeholder="What the project does, your role, notable results…"
                        onChange={event => form.setValue("info", event.target.value)}
                    />
                </Field>

                {(["frontend", "backend", "tools"] as const).map(key => (
                    <Field
                        key={key}
                        label={
                            key === "frontend"
                                ? "Frontend stack"
                                : key === "backend"
                                    ? "Backend stack"
                                    : "Tools"
                        }
                        htmlFor={`tech-${key}`}
                        error={form.errors[`techStacks.${key}`]}
                    >
                        <TagInput
                            id={`tech-${key}`}
                            value={form.values.techStacks[key]}
                            placeholder="React, TypeScript…"
                            onChange={value =>
                                form.setValue("techStacks", {
                                    ...form.values.techStacks,
                                    [key]: value,
                                } as ProjectValues["techStacks"])
                            }
                        />
                    </Field>
                ))}

                <Field label="Display order" htmlFor="order" error={form.errors.order}>
                    <TextInput
                        id="order"
                        type="number"
                        min={0}
                        value={form.values.order}
                        invalid={Boolean(form.errors.order)}
                        onChange={event =>
                            form.setValue("order", Number(event.target.value) || 0)
                        }
                    />
                </Field>

                <div className="admin-row" style={{ alignItems: "flex-start", gap: "1.75rem" }}>
                    <SwitchField
                        id="featured"
                        label="Featured"
                        checked={form.values.featured}
                        onChange={value => form.setValue("featured", value)}
                        hint="Highlighted on the home page"
                    />
                    <SwitchField
                        id="isPublished"
                        label="Published"
                        checked={form.values.isPublished}
                        onChange={value => form.setValue("isPublished", value)}
                        hint="Visible on the public site"
                    />
                </div>

            </div>

        </Modal>
    )
}

export default ProjectFormModal

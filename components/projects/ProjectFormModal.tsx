"use client"

import { useEffect, useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { Field, FormAlert, SwitchField, TextInput, Textarea } from "@/components/ui/Field"
import TagInput from "@/components/ui/TagInput"
import ProjectImagePicker, { type SelectedImage } from "@/components/projects/ProjectImagePicker"
import useForm from "@/lib/forms/use-form"
import api, { uploadImage } from "@/lib/api"
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

/** Human-friendly file name for an already-saved image (derived from its URL). */
const nameFromUrl = (value: string, fallback: string) => {
    const last = value.split("?")[0].split("/").filter(Boolean).pop()
    if (!last) return fallback
    try {
        return decodeURIComponent(last) || fallback
    } catch {
        return last
    }
}

const toImage = (url?: string, fallback = "image"): SelectedImage[] =>
    url ? [{ url, name: nameFromUrl(url, fallback) }] : []

const toGallery = (urls: string[] = []): SelectedImage[] =>
    urls.map((url, index) => ({ url, name: nameFromUrl(url, `image-${index + 1}`) }))

type ProjectFormModalProps = {
    open: boolean
    project: Project | null
    onClose: () => void
    onSaved: () => void
}

const ProjectFormModal = ({ open, project, onClose, onSaved }: ProjectFormModalProps) => {
    const toast = useToast()
    const isEditing = Boolean(project)

    // Device-picked images live outside the yup values (they hold `File`s).
    // On save they are uploaded and turned into the stored media URLs.
    const [logo, setLogo] = useState<SelectedImage[]>([])
    const [thumbnail, setThumbnail] = useState<SelectedImage[]>([])
    const [gallery, setGallery] = useState<SelectedImage[]>([])

    const form = useForm<ProjectValues>({
        initialValues: project ? toValues(project) : EMPTY,
        validationSchema: projectSchema,
        onSubmit: async values => {
            // Upload every freshly chosen file first, then persist the URLs.
            const resolve = (image: SelectedImage) =>
                image.file ? uploadImage(image.file) : Promise.resolve(image.url ?? "")

            const [logoUrl = ""] = await Promise.all(logo.map(resolve))
            const [thumbnailUrl = ""] = await Promise.all(thumbnail.map(resolve))
            const images = await Promise.all(gallery.map(resolve))

            const payload: ProjectValues = {
                ...values,
                logoSrc: logoUrl,
                thumbnail: thumbnailUrl,
                images,
            }

            if (project) {
                await api.put(`projects/${project._id}`, payload)
            } else {
                await api.post("projects", payload)
            }

            toast.success(project ? "Project updated" : "Project created", values.name)
            form.reset()
            setLogo([])
            setThumbnail([])
            setGallery([])
            onSaved()
            onClose()
        },
    })

    // Reload the draft whenever a different row (or the "new" button) is opened.
    useEffect(() => {
        const next = project ? toValues(project) : EMPTY
        form.reset(next)
        setLogo(toImage(next.logoSrc, "logo"))
        setThumbnail(toImage(next.thumbnail, "thumbnail"))
        setGallery(toGallery(next.images))
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

                <div className="admin-span-all">
                    <ProjectImagePicker
                        label="Logo"
                        images={logo}
                        disabled={form.isSubmitting}
                        onChange={setLogo}
                    />
                </div>

                <div className="admin-span-all">
                    <ProjectImagePicker
                        label="Thumbnail"
                        images={thumbnail}
                        disabled={form.isSubmitting}
                        onChange={setThumbnail}
                    />
                </div>

                <div className="admin-span-all">
                    <ProjectImagePicker
                        label="Gallery images"
                        images={gallery}
                        multiple
                        disabled={form.isSubmitting}
                        onChange={setGallery}
                    />
                </div>

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

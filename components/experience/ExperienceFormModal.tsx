"use client"

import { useEffect } from "react"
import useSWR from "swr"
import cls from "classnames"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { Field, FormAlert, SwitchField, TextInput, Textarea } from "@/components/ui/Field"
import TagInput from "@/components/ui/TagInput"
import useForm from "@/lib/forms/use-form"
import api from "@/lib/api"
import { useToast } from "@/components/providers/toast-provider"
import {
    workExperienceSchema,
    type WorkExperienceValues,
} from "@/lib/validation/schemas"
import type { Project, WorkExperience } from "@/types"

const EMPTY: WorkExperienceValues = {
    title: "",
    company: "",
    start: "",
    startDate: "",
    end: "Present",
    endDate: "",
    focus: "",
    highlights: [],
    skills: [],
    projects: [],
    isPublished: true,
    order: 0,
}

const toValues = (experience: WorkExperience): WorkExperienceValues => ({
    title: experience.title ?? "",
    company: experience.company ?? "",
    start: experience.start ?? "",
    startDate: experience.startDate ?? "",
    end: experience.end ?? "Present",
    endDate: experience.endDate ?? "",
    focus: experience.focus ?? "",
    highlights: experience.highlights ?? [],
    skills: experience.skills ?? [],
    projects: (experience.projects ?? []).map(item =>
        typeof item === "string" ? item : item._id,
    ),
    isPublished: experience.isPublished ?? true,
    order: experience.order ?? 0,
})

type ExperienceFormModalProps = {
    open: boolean
    experience: WorkExperience | null
    onClose: () => void
    onSaved: () => void
}

/** Create/edit dialog for a single role of the work-experience timeline. */
const ExperienceFormModal = ({
    open,
    experience,
    onClose,
    onSaved,
}: ExperienceFormModalProps) => {
    const toast = useToast()
    const isEditing = Boolean(experience)
    const { data } = useSWR<{ projects: Project[] }>(
        open ? ["projects/manage", { page: 1, limit: 100, search: "", sort: "name" }] : null,
    )
    const options = data?.projects ?? []

    const form = useForm<WorkExperienceValues>({
        initialValues: experience ? toValues(experience) : EMPTY,
        validationSchema: workExperienceSchema,
        onSubmit: async values => {
            if (experience) {
                await api.put(`work-experiences/${experience._id}`, values)
            } else {
                await api.post("work-experiences", values)
            }

            toast.success(experience ? "Experience updated" : "Experience added", values.title)
            form.reset()
            onSaved()
            onClose()
        },
    })

    // Reload the draft whenever another row (or the "new" button) is opened.
    useEffect(() => {
        form.reset(experience ? toValues(experience) : EMPTY)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [experience, open])

    const toggleProject = (id: string) =>
        form.setValue(
            "projects",
            form.values.projects.includes(id)
                ? form.values.projects.filter(item => item !== id)
                : [...form.values.projects, id],
        )

    return (
        <Modal
            open={open}
            size="wide"
            title={isEditing ? `Edit ${experience?.title}` : "New experience"}
            description={
                isEditing
                    ? "Leave the end date empty for the role you hold right now"
                    : "Roles are ordered by the order field, then by start date"
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
                    <Button type="submit" icon="check" form="experience-form" loading={form.isSubmitting}>
                        {isEditing ? "Save changes" : "Create experience"}
                    </Button>
                </>
            }
        >
            <FormAlert message={form.errors.form} />

            <form id="experience-form" onSubmit={form.handleSubmit} className="admin-form">
                <Field label="Role title" htmlFor="title" required error={form.errors.title}>
                    <TextInput
                        id="title"
                        value={form.values.title}
                        placeholder="Frontend Developer"
                        invalid={Boolean(form.errors.title)}
                        onChange={event => form.setValue("title", event.target.value)}
                    />
                </Field>

                <Field label="Company" htmlFor="company" required error={form.errors.company}>
                    <TextInput
                        id="company"
                        value={form.values.company}
                        placeholder="Acme Studio"
                        invalid={Boolean(form.errors.company)}
                        onChange={event => form.setValue("company", event.target.value)}
                    />
                </Field>

                <Field label="Start label" htmlFor="start" required error={form.errors.start}>
                    <TextInput
                        id="start"
                        value={form.values.start}
                        placeholder="March 2024"
                        invalid={Boolean(form.errors.start)}
                        onChange={event => form.setValue("start", event.target.value)}
                    />
                </Field>

                <Field
                    label="Start (machine date)"
                    htmlFor="startDate"
                    hint="Used in the timeline markup, e.g. 2024-03"
                    error={form.errors.startDate}
                >
                    <TextInput
                        id="startDate"
                        value={form.values.startDate}
                        placeholder="2024-03"
                        invalid={Boolean(form.errors.startDate)}
                        onChange={event => form.setValue("startDate", event.target.value)}
                    />
                </Field>

                <Field label="End label" htmlFor="end" error={form.errors.end}>
                    <TextInput
                        id="end"
                        value={form.values.end}
                        placeholder="Present"
                        invalid={Boolean(form.errors.end)}
                        onChange={event => form.setValue("end", event.target.value)}
                    />
                </Field>

                <Field
                    label="End (machine date)"
                    htmlFor="endDate"
                    hint="Empty means “current position”"
                    error={form.errors.endDate}
                >
                    <TextInput
                        id="endDate"
                        value={form.values.endDate}
                        placeholder="2025-06"
                        invalid={Boolean(form.errors.endDate)}
                        onChange={event => form.setValue("endDate", event.target.value)}
                    />
                </Field>

                <Field
                    label="Focus"
                    htmlFor="focus"
                    error={form.errors.focus}
                    className="admin-span-all"
                >
                    <Textarea
                        id="focus"
                        rows={3}
                        value={form.values.focus}
                        placeholder="What the role was about, in one or two sentences…"
                        invalid={Boolean(form.errors.focus)}
                        onChange={event => form.setValue("focus", event.target.value)}
                    />
                </Field>

                <Field
                    label="Highlights"
                    htmlFor="highlights"
                    hint="One bullet per entry - listed under the role"
                    error={form.errors.highlights}
                    className="admin-span-all"
                >
                    <TagInput
                        id="highlights"
                        value={form.values.highlights}
                        placeholder="Shipped the checkout redesign…"
                        invalid={Boolean(form.errors.highlights)}
                        onChange={value => form.setValue("highlights", value)}
                    />
                </Field>

                <Field label="Skills" htmlFor="skills" error={form.errors.skills}>
                    <TagInput
                        id="skills"
                        value={form.values.skills}
                        placeholder="Next.js, TypeScript…"
                        invalid={Boolean(form.errors.skills)}
                        onChange={value => form.setValue("skills", value)}
                    />
                </Field>

                <Field label="Display order" htmlFor="experience-order" error={form.errors.order}>
                    <TextInput
                        id="experience-order"
                        type="number"
                        min={0}
                        value={form.values.order}
                        invalid={Boolean(form.errors.order)}
                        onChange={event => form.setValue("order", Number(event.target.value) || 0)}
                    />
                </Field>

                <Field
                    label="Linked projects"
                    htmlFor="linked-projects"
                    hint="Tap the projects this role covered"
                    error={form.errors.projects}
                    className="admin-span-all"
                >
                    <div
                        id="linked-projects"
                        className="admin-chips"
                        style={{ maxHeight: 168, overflowY: "auto" }}
                    >
                        {options.length === 0 ? (
                            <span className="admin-muted">No projects to link yet</span>
                        ) : (
                            options.map(project => (
                                <button
                                    key={project._id}
                                    type="button"
                                    className={cls(
                                        "admin-chip",
                                        form.values.projects.includes(project._id) && "is-active",
                                    )}
                                    aria-pressed={form.values.projects.includes(project._id)}
                                    onClick={() => toggleProject(project._id)}
                                >
                                    {project.name}
                                </button>
                            ))
                        )}
                    </div>
                </Field>

                <SwitchField
                    id="experience-published"
                    label="Published"
                    checked={form.values.isPublished}
                    onChange={value => form.setValue("isPublished", value)}
                    hint="Visible in the public timeline"
                />

            </form>
        </Modal>
    )
}

export default ExperienceFormModal

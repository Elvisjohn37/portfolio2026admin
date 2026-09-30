"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import useForm from "@/lib/forms/use-form"
import api from "@/lib/api"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button from "@/components/ui/Button"
import { Field, FormAlert, Select, TextInput, Textarea } from "@/components/ui/Field"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import { Icon } from "@/components/ui/Icons"
import { useToast } from "@/components/providers/toast-provider"
import { aboutSchema, type AboutValues } from "@/lib/validation/schemas"
import type { AboutProfile } from "@/types"

const EMPTY: AboutValues = {
    firstName: "",
    middleName: "",
    lastName: "",
    position: "",
    about1: "",
    about2: "",
    address: "",
    province: "",
    country: "",
    degree: "",
    school: "",
    schoolYear: "",
    avatar: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    resumeUrl: "",
    yearsOfExperience: 0,
}

const toValues = (p: AboutProfile): AboutValues => ({
    firstName: p.firstName ?? "",
    middleName: p.middleName ?? "",
    lastName: p.lastName ?? "",
    position: p.position ?? "",
    about1: p.about1 ?? "",
    about2: p.about2 ?? "",
    address: p.address ?? "",
    province: p.province ?? "",
    country: p.country ?? "",
    degree: p.degree ?? "",
    school: p.school ?? "",
    schoolYear: p.schoolYear ?? "",
    avatar: p.avatar ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    github: p.github ?? "",
    linkedin: p.linkedin ?? "",
    resumeUrl: p.resumeUrl ?? "",
    yearsOfExperience: p.yearsOfExperience ?? 0,
})

const fullName = (profile: AboutProfile) =>
    [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")

/**
 * The editing surface for a single About profile. The parent keys it by
 * `id + updatedAt`, so every save (and profile switch) remounts the form with
 * freshly loaded values - there is no stale "unsaved changes" state to reconcile.
 */
const ProfileForm = ({
    profile,
    onSaved,
}: {
    /** `null` switches the form to create mode (POST instead of PUT). */
    profile: AboutProfile | null
    onSaved: (saved: AboutProfile) => Promise<void> | void
}) => {
    const toast = useToast()

    const form = useForm<AboutValues>({
        initialValues: profile ? toValues(profile) : EMPTY,
        validationSchema: aboutSchema,
        onSubmit: async values => {
            const saved = profile
                ? (await api.put<{ profile: AboutProfile }>(`about/${profile._id}`, values)).profile
                : (await api.post<{ profile: AboutProfile }>("about", values)).profile

            toast.success(profile ? "Profile updated" : "Profile created", fullName(saved))

            // `onSaved` revalidates the list; awaiting it inside `onSubmit` keeps
            // the save button busy until the fresh document is back, so a second
            // click cannot fire a duplicate request.
            await onSaved(saved)
        },
    })

    return (
        <>
            <FormAlert message={form.errors.form} />
            <div className="admin-stack">
                <SectionCard title="Identity">
                    <div className="admin-fields">
                        <Field
                            label="First name"
                            htmlFor="firstName"
                            required
                            error={form.errors.firstName}
                        >
                            <TextInput
                                id="firstName"
                                value={form.values.firstName}
                                invalid={Boolean(form.errors.firstName)}
                                onChange={event => form.setValue("firstName", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Middle name"
                            htmlFor="middleName"
                            error={form.errors.middleName}
                            hint="Optional"
                        >
                            <TextInput
                                id="middleName"
                                value={form.values.middleName}
                                invalid={Boolean(form.errors.middleName)}
                                onChange={event => form.setValue("middleName", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Last name"
                            htmlFor="lastName"
                            required
                            error={form.errors.lastName}
                        >
                            <TextInput
                                id="lastName"
                                value={form.values.lastName}
                                invalid={Boolean(form.errors.lastName)}
                                onChange={event => form.setValue("lastName", event.target.value)}
                            />
                        </Field>

                        <Field label="Position" htmlFor="position" error={form.errors.position}>
                            <TextInput
                                id="position"
                                value={form.values.position}
                                invalid={Boolean(form.errors.position)}
                                placeholder="Senior Web Developer"
                                onChange={event => form.setValue("position", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Years of experience"
                            htmlFor="yearsOfExperience"
                            error={form.errors.yearsOfExperience}
                        >
                            <TextInput
                                id="yearsOfExperience"
                                type="number"
                                min={0}
                                max={80}
                                value={form.values.yearsOfExperience}
                                invalid={Boolean(form.errors.yearsOfExperience)}
                                onChange={event =>
                                    form.setValue("yearsOfExperience", Number(event.target.value) || 0)
                                }
                            />
                        </Field>

                        <Field
                            label="Avatar URL"
                            htmlFor="avatar"
                            error={form.errors.avatar}
                            hint="Portrait used by the hero, e.g. /profile-pic.jpg"
                        >
                            <TextInput
                                id="avatar"
                                value={form.values.avatar}
                                invalid={Boolean(form.errors.avatar)}
                                placeholder="/profile-pic.jpg"
                                onChange={event => form.setValue("avatar", event.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>
                <SectionCard
                    title="Biography"
                    hint="The short intro under the hero and the long form on the About page."
                >
                    <div className="admin-fields admin-fields--wide">
                        <Field
                            label="Short intro"
                            htmlFor="about1"
                            error={form.errors.about1}
                            className="admin-span-all"
                        >
                            <Textarea
                                id="about1"
                                rows={3}
                                value={form.values.about1}
                                invalid={Boolean(form.errors.about1)}
                                onChange={event => form.setValue("about1", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Full bio"
                            htmlFor="about2"
                            error={form.errors.about2}
                            className="admin-span-all"
                        >
                            <Textarea
                                id="about2"
                                rows={6}
                                value={form.values.about2}
                                invalid={Boolean(form.errors.about2)}
                                onChange={event => form.setValue("about2", event.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>

                <SectionCard title="Location">
                    <div className="admin-fields">
                        <Field
                            label="Street address"
                            htmlFor="address"
                            error={form.errors.address}
                            className="admin-span-all"
                        >
                            <TextInput
                                id="address"
                                value={form.values.address}
                                invalid={Boolean(form.errors.address)}
                                onChange={event => form.setValue("address", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Province / state"
                            htmlFor="province"
                            error={form.errors.province}
                        >
                            <TextInput
                                id="province"
                                value={form.values.province}
                                invalid={Boolean(form.errors.province)}
                                onChange={event => form.setValue("province", event.target.value)}
                            />
                        </Field>

                        <Field label="Country" htmlFor="country" error={form.errors.country}>
                            <TextInput
                                id="country"
                                value={form.values.country}
                                invalid={Boolean(form.errors.country)}
                                onChange={event => form.setValue("country", event.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>
                <SectionCard title="Education">
                    <div className="admin-fields">
                        <Field label="Degree" htmlFor="degree" error={form.errors.degree}>
                            <TextInput
                                id="degree"
                                value={form.values.degree}
                                invalid={Boolean(form.errors.degree)}
                                placeholder="Bachelor of Science in Information Technology"
                                onChange={event => form.setValue("degree", event.target.value)}
                            />
                        </Field>

                        <Field label="School" htmlFor="school" error={form.errors.school}>
                            <TextInput
                                id="school"
                                value={form.values.school}
                                invalid={Boolean(form.errors.school)}
                                onChange={event => form.setValue("school", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="School years"
                            htmlFor="schoolYear"
                            error={form.errors.schoolYear}
                            hint="e.g. 2014 - 2018"
                        >
                            <TextInput
                                id="schoolYear"
                                value={form.values.schoolYear}
                                invalid={Boolean(form.errors.schoolYear)}
                                onChange={event => form.setValue("schoolYear", event.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>

                <SectionCard title="Contact & links" hint="Shown in the footer and contact section.">
                    <div className="admin-fields">
                        <Field label="Email" htmlFor="email" error={form.errors.email}>
                            <TextInput
                                id="email"
                                type="email"
                                value={form.values.email}
                                invalid={Boolean(form.errors.email)}
                                placeholder="you@example.com"
                                onChange={event => form.setValue("email", event.target.value)}
                            />
                        </Field>

                        <Field label="Phone" htmlFor="phone" error={form.errors.phone}>
                            <TextInput
                                id="phone"
                                value={form.values.phone}
                                invalid={Boolean(form.errors.phone)}
                                onChange={event => form.setValue("phone", event.target.value)}
                            />
                        </Field>

                        <Field label="GitHub" htmlFor="github" error={form.errors.github}>
                            <TextInput
                                id="github"
                                value={form.values.github}
                                invalid={Boolean(form.errors.github)}
                                placeholder="https://github.com/…"
                                onChange={event => form.setValue("github", event.target.value)}
                            />
                        </Field>

                        <Field label="LinkedIn" htmlFor="linkedin" error={form.errors.linkedin}>
                            <TextInput
                                id="linkedin"
                                value={form.values.linkedin}
                                invalid={Boolean(form.errors.linkedin)}
                                placeholder="https://linkedin.com/in/…"
                                onChange={event => form.setValue("linkedin", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Resume URL"
                            htmlFor="resumeUrl"
                            error={form.errors.resumeUrl}
                            hint="Downloadable file, e.g. /cv/…pdf"
                            className="admin-span-all"
                        >
                            <TextInput
                                id="resumeUrl"
                                value={form.values.resumeUrl}
                                invalid={Boolean(form.errors.resumeUrl)}
                                placeholder="/cv/Elvis_John_Reyes_Cayetano_Resume.pdf"
                                onChange={event => form.setValue("resumeUrl", event.target.value)}
                            />
                        </Field>
                    </div>
                </SectionCard>
                <div className="admin-row" style={{ gap: "0.75rem", justifyContent: "flex-end" }}>
                    {form.isDirty ? (
                        <span className="admin-muted" style={{ marginRight: "auto" }}>
                            Unsaved changes
                        </span>
                    ) : null}
                    <Button
                        icon="check"
                        loading={form.isSubmitting}
                        onClick={() => void form.handleSubmit()}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </>
    )
}

const ProfileView = () => {
    const { data, error, isLoading, mutate } = useSWR<{ profiles: AboutProfile[] }>(["about"])

    const profiles = data?.profiles ?? []
    const [selectedId, setSelectedId] = useState("")
    const [creating, setCreating] = useState(false)

    const profile = profiles.find(item => item._id === selectedId) ?? profiles[0] ?? null

    // Create mode stays on until the freshly posted document shows up in the
    // list, so the form never flashes back to the empty state mid-save.
    useEffect(() => {
        if (creating && profile) setCreating(false)
    }, [creating, profile])

    const handleSaved = useCallback(
        async (saved: AboutProfile) => {
            setSelectedId(saved._id)
            await mutate()
        },
        [mutate],
    )

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Profile"
                description="Hero, bio and contact details shown across the public portfolio."
            />

            {error ? (
                <div className="admin-alert admin-alert--danger">
                    <Icon name="alert" size={16} />
                    <div className="flex-1">
                        <p className="admin-toast__title">Could not load the profile</p>
                        <p className="admin-toast__text">{error.message}</p>
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => void mutate()}
                    >
                        Retry
                    </button>
                </div>
            ) : null}
            {isLoading && !data ? (
                <SectionCard bare>
                    <TableSkeleton rows={4} />
                </SectionCard>
            ) : data ? (
                profiles.length === 0 && !creating ? (
                    <SectionCard bare>
                        <EmptyState
                            icon="user"
                            title="No profile yet"
                            description="Create the profile behind the hero, the About page and the contact details."
                            action={
                                <Button icon="plus" onClick={() => setCreating(true)}>
                                    Create profile
                                </Button>
                            }
                        />
                    </SectionCard>
                ) : (
                    <div className="admin-stack">
                        {profiles.length > 1 && !creating ? (
                            <SectionCard
                                title="Editing"
                                hint="Each About block can reference a different profile."
                            >
                                <Field label="Profile" htmlFor="profile-select">
                                    <Select
                                        id="profile-select"
                                        value={profile?._id ?? ""}
                                        options={profiles.map(item => ({
                                            value: item._id,
                                            label: fullName(item) || "Unnamed profile",
                                        }))}
                                        onChange={event => setSelectedId(event.target.value)}
                                    />
                                </Field>
                            </SectionCard>
                        ) : null}

                        <ProfileForm
                            key={creating ? "new" : `${profile?._id ?? "missing"}:${profile?.updatedAt ?? ""}`}
                            profile={creating ? null : profile}
                            onSaved={handleSaved}
                        />
                    </div>
                )
            ) : null}
        </>
    )
}

export default ProfileView






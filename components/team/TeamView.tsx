"use client"

import { useEffect, useState } from "react"
import useList from "@/lib/use-list"
import { team } from "@/lib/api"
import { formatDate, formatDateTime, formatRelative, initials } from "@/lib/format"
import { useAuth } from "@/components/providers/app-providers"
import { useToast } from "@/components/providers/toast-provider"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import { Field, FormAlert, Select, SwitchField, TextInput } from "@/components/ui/Field"
import { SearchInput } from "@/components/ui/Filters"
import { TableSkeleton } from "@/components/ui/Skeletons"
import EmptyState from "@/components/ui/EmptyState"
import Pagination from "@/components/ui/Pagination"
import RowActions from "@/components/ui/RowActions"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import useForm from "@/lib/forms/use-form"
import {
    PASSWORD_HINT,
    memberFormSchema,
    type TeamMemberFormValues,
} from "@/lib/validation/schemas"
import type { TeamMember, TeamRole } from "@/types"

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
    { value: "admin", label: "Admin - content, inbox and team" },
    { value: "editor", label: "Editor - content and inbox" },
]

const EMPTY_MEMBER: TeamMemberFormValues = {
    name: "",
    email: "",
    role: "editor",
    isActive: true,
    password: "",
}

/**
 * Create/edit dialog. The password only belongs to the create flow: the API
 * update endpoint validates with `profileSchema` and never accepts one.
 */
const MemberFormModal = ({
    open,
    member,
    onClose,
    onSaved,
}: {
    open: boolean
    member: TeamMember | null
    onClose: () => void
    onSaved: () => void
}) => {
    const toast = useToast()
    const { user } = useAuth()
    const isSelf = member ? member._id === user._id : false

    const initialValues: TeamMemberFormValues = member
        ? {
              name: member.name,
              email: member.email,
              role: member.role,
              isActive: member.isActive,
              password: "",
          }
        : EMPTY_MEMBER

    const form = useForm<TeamMemberFormValues>({
        initialValues,
        validationSchema: memberFormSchema(!member),
        onSubmit: async values => {
            // role/isActive are always sent: the API schema defaults them, so
            // omitting either would silently promote or reactivate an account.
            const payload = {
                name: values.name,
                email: values.email,
                role: values.role as TeamRole,
                isActive: values.isActive,
            }

            if (member) {
                await team.update(member._id, payload)
            } else {
                await team.create({ ...payload, password: values.password })
            }

            toast.success(member ? "Team member updated" : "Team member created", values.email)
            form.reset()
            onSaved()
            onClose()
        },
    })

    useEffect(() => {
        form.reset(initialValues)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [member, open])

    return (
        <Modal
            open={open}
            title={member ? `Edit ${member.name}` : "Add a team member"}
            description={
                member
                    ? "Update the details used to sign in to this panel."
                    : "New members sign in with the email address and password set here."
            }
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={form.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" icon="check" form="member-form" loading={form.isSubmitting}>
                        {member ? "Save changes" : "Create member"}
                    </Button>
                </>
            }
        >
            <FormAlert message={form.errors.form} />

            <form id="member-form" onSubmit={form.handleSubmit} className="admin-form">
                <Field label="Full name" htmlFor="member-name" required error={form.errors.name}>
                    <TextInput
                        id="member-name"
                        value={form.values.name}
                        placeholder="Ada Lovelace"
                        invalid={Boolean(form.errors.name)}
                        onChange={event => form.setValue("name", event.target.value)}
                    />
                </Field>

                <Field
                    label="Email"
                    htmlFor="member-email"
                    required
                    error={form.errors.email}
                    hint="Also the username used to sign in."
                >
                    <TextInput
                        id="member-email"
                        type="email"
                        autoComplete="off"
                        value={form.values.email}
                        placeholder="ada@example.com"
                        invalid={Boolean(form.errors.email)}
                        onChange={event => form.setValue("email", event.target.value)}
                    />
                </Field>

                {member ? null : (
                    <Field
                        label="Password"
                        htmlFor="member-password"
                        required
                        error={form.errors.password}
                        hint={PASSWORD_HINT}
                    >
                        <TextInput
                            id="member-password"
                            type="password"
                            autoComplete="new-password"
                            value={form.values.password}
                            invalid={Boolean(form.errors.password)}
                            onChange={event => form.setValue("password", event.target.value)}
                        />
                    </Field>
                )}

                <Field
                    label="Role"
                    htmlFor="member-role"
                    error={form.errors.role}
                    hint="Only admins can reach this Team screen."
                >
                    <Select
                        id="member-role"
                        value={form.values.role}
                        options={ROLE_OPTIONS}
                        invalid={Boolean(form.errors.role)}
                        onChange={event => form.setValue("role", event.target.value as TeamRole)}
                    />
                </Field>

                <SwitchField
                    id="member-is-active"
                    label="Active account"
                    checked={form.values.isActive}
                    disabled={isSelf}
                    onChange={checked => form.setValue("isActive", checked)}
                    hint={
                        isSelf
                            ? "You cannot deactivate your own account."
                            : "Deactivated members cannot sign in."
                    }
                />
            </form>
        </Modal>
    )
}

const TeamView = () => {
    const { user, isAdmin } = useAuth()
    const toast = useToast()

    // The API only supports search + paging here (see `listQuery` on the
    // server), so the toolbar mirrors the Stack groups screen.
    const list = useList<TeamMember>({
        path: "auth/users",
        listKey: "users",
        sort: "-createdAt",
    })

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<TeamMember | null>(null)
    const [deleting, setDeleting] = useState<TeamMember | null>(null)

    const openCreate = () => {
        setEditing(null)
        setFormOpen(true)
    }

    if (!isAdmin) {
        return (
            <>
                <PageHeader
                    eyebrow="Account"
                    title="Team"
                    description="The accounts that can sign in to this panel."
                />
                <SectionCard>
                    <EmptyState
                        icon="lock"
                        title="Administrators only"
                        description="Your role cannot manage accounts. Ask another admin to change it if you need access."
                    />
                </SectionCard>
            </>
        )
    }

    return (
        <>
            <PageHeader
                eyebrow="Account"
                title="Team"
                description="The accounts that can sign in to this panel."
                actions={
                    <Button icon="plus" size="sm" onClick={openCreate}>
                        Add member
                    </Button>
                }
            />

            <SectionCard bare>
                <div className="admin-section__head" style={{ alignItems: "flex-start" }}>
                    <div className="min-w-0" style={{ flex: 1 }}>
                        <h2 className="admin-section__title">Members</h2>
                        <p className="admin-section__hint">
                            Admins manage content, the inbox and this screen; editors handle content.
                        </p>
                    </div>
                    <SearchInput
                        value={list.search}
                        onChange={list.setSearch}
                        placeholder="Search name or email…"
                    />
                </div>

                {list.isLoading && list.items.length === 0 ? (
                    <TableSkeleton rows={4} />
                ) : list.items.length === 0 ? (
                    <EmptyState
                        icon="users"
                        title={list.search ? "No matching members" : "No team members yet"}
                        description={
                            list.search
                                ? "Try another name or email address."
                                : "Add a colleague so they can sign in and help with the content."
                        }
                        action={
                            list.search ? undefined : (
                                <Button icon="plus" size="sm" onClick={openCreate}>
                                    Add member
                                </Button>
                            )
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last sign-in</th>
                                    <th>Added</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {list.items.map(member => {
                                    const isSelf = member._id === user._id

                                    return (
                                        <tr key={member._id}>
                                            <td>
                                                <div className="admin-row" style={{ gap: "0.75rem" }}>
                                                    <span className="admin-avatar">
                                                        {initials(member.name)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="admin-cell__title truncate">
                                                            {member.name}
                                                            {isSelf ? (
                                                                <Badge tone="primary" className="ml-2">
                                                                    You
                                                                </Badge>
                                                            ) : null}
                                                        </p>
                                                        <p className="admin-cell__sub truncate">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge
                                                    tone={
                                                        member.role === "admin" ? "primary" : "info"
                                                    }
                                                    title={
                                                        member.role === "admin"
                                                            ? "Full access"
                                                            : "Content access"
                                                    }
                                                >
                                                    {member.role}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge
                                                    tone={member.isActive ? "success" : "neutral"}
                                                >
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            <td
                                                className="admin-cell__sub whitespace-nowrap"
                                                title={formatDateTime(member.lastLoginAt)}
                                            >
                                                {member.lastLoginAt
                                                    ? formatRelative(member.lastLoginAt)
                                                    : "Never"}
                                            </td>
                                            <td className="admin-cell__sub whitespace-nowrap">
                                                {formatDate(member.createdAt)}
                                            </td>
                                            <td>
                                                <RowActions
                                                    editLabel={`Edit ${member.name}`}
                                                    deleteLabel={
                                                        isSelf
                                                            ? "You cannot delete your own account"
                                                            : `Remove ${member.name}`
                                                    }
                                                    onEdit={() => {
                                                        setEditing(member)
                                                        setFormOpen(true)
                                                    }}
                                                    onDelete={() => {
                                                        if (isSelf) {
                                                            toast.error(
                                                                "You cannot delete your own account",
                                                                "Ask another admin to remove it.",
                                                            )

                                                            return
                                                        }

                                                        setDeleting(member)
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    pagination={list.pagination}
                    label="members"
                    onPageChange={list.setPage}
                />
            </SectionCard>

            <MemberFormModal
                open={formOpen}
                member={editing}
                onClose={() => setFormOpen(false)}
                onSaved={() => void list.refresh()}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title="Remove team member"
                description={
                    deleting
                        ? `${deleting.name} loses access to this panel straight away, along with any active session.`
                        : ""
                }
                itemLabel="Team member"
                onClose={() => setDeleting(null)}
                onConfirm={async () => {
                    if (!deleting) return
                    await team.remove(deleting._id)
                    void list.refresh()
                }}
            />
        </>
    )
}

export default TeamView


"use client"

import { useState, type ReactNode } from "react"
import cls from "classnames"
import { account } from "@/lib/api"
import useForm from "@/lib/forms/use-form"
import { formatDate, formatDateTime, formatRelative, initials } from "@/lib/format"
import { useAuth } from "@/components/providers/app-providers"
import { useTheme } from "@/components/providers/theme-provider"
import { useToast } from "@/components/providers/toast-provider"
import PageHeader from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/Cards"
import Button, { LinkButton } from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { Field, FormAlert, TextInput } from "@/components/ui/Field"
import { Icon } from "@/components/ui/Icons"
import {
    PASSWORD_HINT,
    accountProfileSchema,
    changePasswordSchema,
    type AccountProfileValues,
    type ChangePasswordValues,
} from "@/lib/validation/schemas"
import type { AdminUser } from "@/types"

const THEME_OPTIONS = [
    { value: "dark", label: "Dark", icon: "moon" },
    { value: "light", label: "Light", icon: "sun" },
] as const

const EMPTY_PASSWORD_FORM: ChangePasswordValues = {
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
}

/** Label / value line of the overview card. */
const MetaRow = ({ label, value, title }: { label: string; value: ReactNode; title?: string }) => (
    <div className="admin-row" style={{ justifyContent: "space-between", gap: "1rem" }}>
        <span className="admin-muted">{label}</span>
        <span className="min-w-0 truncate" title={title} style={{ textAlign: "right" }}>
            {value}
        </span>
    </div>
)

/** Password input with the same reveal button the sign-in screen uses. */
const PasswordField = ({
    id,
    label,
    value,
    error,
    autoComplete,
    hint,
    onChange,
}: {
    id: string
    label: string
    value: string
    error?: string
    autoComplete: string
    hint?: string
    onChange: (value: string) => void
}) => {
    const [reveal, setReveal] = useState(false)

    return (
        <Field label={label} htmlFor={id} error={error} hint={hint} required>
            <div className="relative">
                <TextInput
                    id={id}
                    type={reveal ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder="••••••••"
                    value={value}
                    invalid={Boolean(error)}
                    className="pr-11"
                    onChange={event => onChange(event.target.value)}
                />
                <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--icon absolute right-1 top-1/2 -translate-y-1/2"
                    style={{ minHeight: 34, width: 34 }}
                    onClick={() => setReveal(current => !current)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    tabIndex={-1}
                >
                    <Icon name={reveal ? "eyeOff" : "eye"} size={15} />
                </button>
            </div>
        </Field>
    )
}

/**
 * Name + email. Keyed upstream by the identity fields, so a successful save
 * always leaves the form showing exactly what the API stored.
 */
const DetailsForm = ({ onSaved }: { onSaved: (user: AdminUser) => void }) => {
    const { user } = useAuth()
    const toast = useToast()

    const form = useForm<AccountProfileValues>({
        initialValues: { name: user.name, email: user.email },
        validationSchema: accountProfileSchema,
        onSubmit: async values => {
            // role/isActive always travel with the request: the API schema
            // defaults them (admin / active) and applies them for admins, so
            // leaving them out would silently rewrite the account.
            const { user: saved } = await account.updateProfile({
                name: values.name,
                email: values.email,
                role: user.role,
                isActive: user.isActive,
            })

            onSaved(saved)
            toast.success("Account updated", saved.email)
        },
    })

    return (
        <form onSubmit={form.handleSubmit} noValidate>
            <SectionCard
                title="Sign-in details"
                hint="Your name appears across this panel; the email is what you sign in with."
            >
                <div className="admin-stack" style={{ gap: "1rem" }}>
                    <div className="admin-fields">
                        <Field label="Name" htmlFor="account-name" required error={form.errors.name}>
                            <TextInput
                                id="account-name"
                                autoComplete="name"
                                placeholder="Elvis Cayetano"
                                value={form.values.name}
                                invalid={Boolean(form.errors.name)}
                                onChange={event => form.setValue("name", event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Email"
                            htmlFor="account-email"
                            required
                            error={form.errors.email}
                            hint="Changing it never signs you out of this session."
                        >
                            <TextInput
                                id="account-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={form.values.email}
                                invalid={Boolean(form.errors.email)}
                                onChange={event => form.setValue("email", event.target.value)}
                            />
                        </Field>
                    </div>

                    <FormAlert message={form.errors.form} />

                    <div className="admin-row" style={{ gap: "0.75rem", justifyContent: "flex-end" }}>
                        {form.isDirty ? (
                            <span className="admin-muted" style={{ marginRight: "auto" }}>
                                Unsaved changes
                            </span>
                        ) : null}
                        <Button type="submit" icon="check" loading={form.isSubmitting}>
                            Save changes
                        </Button>
                    </div>
                </div>
            </SectionCard>
        </form>
    )
}

/**
 * `PUT /api/auth/password` keeps issuing nothing but a new hash, so the JWT in
 * the httpOnly cookie stays valid - the session is deliberately left alone.
 */
const PasswordForm = ({ onSaved }: { onSaved: (user: AdminUser) => void }) => {
    const toast = useToast()

    const form = useForm<ChangePasswordValues>({
        initialValues: EMPTY_PASSWORD_FORM,
        validationSchema: changePasswordSchema,
        onSubmit: async values => {
            const { user } = await account.changePassword(values)

            onSaved(user)
            toast.success("Password updated", "Use it the next time you sign in.")
            form.reset(EMPTY_PASSWORD_FORM)
        },
    })

    return (
        <form onSubmit={form.handleSubmit} noValidate>
            <SectionCard title="Password" hint="Use 8+ characters with an uppercase, a lowercase and a number.">
                <div className="admin-stack" style={{ gap: "1rem" }}>
                    <div className="admin-fields">
                        <PasswordField
                            id="currentPassword"
                            label="Current password"
                            autoComplete="current-password"
                            value={form.values.currentPassword}
                            error={form.errors.currentPassword}
                            onChange={value => form.setValue("currentPassword", value)}
                        />
                        <PasswordField
                            id="password"
                            label="New password"
                            autoComplete="new-password"
                            hint={PASSWORD_HINT}
                            value={form.values.password}
                            error={form.errors.password}
                            onChange={value => form.setValue("password", value)}
                        />
                        <PasswordField
                            id="passwordConfirmation"
                            label="Confirm new password"
                            autoComplete="new-password"
                            value={form.values.passwordConfirmation}
                            error={form.errors.passwordConfirmation}
                            onChange={value => form.setValue("passwordConfirmation", value)}
                        />
                    </div>

                    <div className="admin-alert admin-alert--info">
                        <Icon name="info" size={16} />
                        <span>
                            Updating the password never signs you out here - use &quot;Sign out&quot;
                            below to end this session.
                        </span>
                    </div>

                    <FormAlert message={form.errors.form} />

                    <div className="admin-row" style={{ gap: "0.75rem", justifyContent: "flex-end" }}>
                        <Button type="submit" icon="lock" loading={form.isSubmitting}>
                            Update password
                        </Button>
                    </div>
                </div>
            </SectionCard>
        </form>
    )
}

/** Read-only summary plus the theme choice, which lives in localStorage. */
const OverviewCard = () => {
    const { user, isAdmin, logout } = useAuth()
    const { theme, setTheme } = useTheme()

    return (
        <SectionCard
            title="This account"
            hint={
                isAdmin
                    ? "Role and access are managed on the Team screen."
                    : "Only an admin can change your role or access."
            }
        >
            <div className="admin-stack" style={{ gap: "0.9rem" }}>
                <div className="admin-row" style={{ gap: "0.8rem" }}>
                    <span
                        className="admin-avatar"
                        style={{ width: 46, height: 46, fontSize: "0.85rem" }}
                        aria-hidden="true"
                    >
                        {initials(user.name)}
                    </span>
                    <div className="min-w-0">
                        <p className="admin-cell__title truncate">{user.name}</p>
                        <p className="admin-cell__sub truncate">{user.email}</p>
                    </div>
                </div>

                <hr className="admin-divider" />

                <div className="admin-stack" style={{ gap: "0.6rem" }}>
                    <MetaRow
                        label="Role"
                        value={
                            <Badge tone={isAdmin ? "primary" : "info"}>
                                {isAdmin ? "Admin" : "Editor"}
                            </Badge>
                        }
                    />
                    <MetaRow
                        label="Access"
                        value={
                            <Badge
                                tone={user.isActive ? "success" : "danger"}
                                icon={user.isActive ? "check" : "close"}
                            >
                                {user.isActive ? "Active" : "Disabled"}
                            </Badge>
                        }
                    />
                    <MetaRow
                        label="Last sign-in"
                        title={formatDateTime(user.lastLoginAt)}
                        value={user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Never"}
                    />
                    <MetaRow label="Member since" value={formatDate(user.createdAt)} />
                </div>

                <hr className="admin-divider" />

                <div className="admin-row" style={{ justifyContent: "space-between", gap: "1rem" }}>
                    <span className="admin-muted">Appearance</span>
                    <div className="admin-chips">
                        {THEME_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                className={cls("admin-chip", theme === option.value && "is-active")}
                                onClick={() => setTheme(option.value)}
                            >
                                <Icon name={option.icon} size={13} />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-row" style={{ gap: "0.6rem" }}>
                    {isAdmin ? (
                        <LinkButton href="/dashboard/team" variant="soft" size="sm" icon="users">
                            Manage team
                        </LinkButton>
                    ) : null}
                    <Button variant="ghost" size="sm" icon="logout" onClick={() => void logout()}>
                        Sign out
                    </Button>
                </div>
            </div>
        </SectionCard>
    )
}

/**
 * "Settings" in the sidebar: the signed-in account, as opposed to /dashboard/profile
 * which edits the public About document. Everything here talks to `/api/auth/*`
 * for the current token, so no id is ever passed around.
 */
const AccountView = () => {
    const { user, updateUser } = useAuth()

    return (
        <>
            <PageHeader
                eyebrow="Account"
                title="Settings"
                description="Your name, sign-in email and password for this panel."
            />

            <div className="admin-grid admin-grid--split">
                <div className="admin-stack">
                    {/* Keyed on the identity fields, not updatedAt: changing a
                        password must not wipe a half-typed name. */}
                    <DetailsForm
                        key={`${user._id}:${user.name}:${user.email}`}
                        onSaved={updateUser}
                    />
                    <PasswordForm onSaved={updateUser} />
                </div>

                <OverviewCard />
            </div>
        </>
    )
}

export default AccountView

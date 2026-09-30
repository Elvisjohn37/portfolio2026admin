"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useForm from "@/lib/forms/use-form"
import { loginSchema, type LoginValues } from "@/lib/validation/schemas"
import { auth, ApiError } from "@/lib/api"
import { APP_INITIALS, APP_NAME } from "@/lib/constants"
import { Button } from "@/components/ui/Button"
import { Field, FormAlert, TextInput } from "@/components/ui/Field"
import { Icon } from "@/components/ui/Icons"

const LoginForm = () => {
    const router = useRouter()
    const params = useSearchParams()
    const [revealPassword, setRevealPassword] = useState(false)

    const form = useForm<LoginValues>({
        initialValues: { email: "", password: "" },
        validationSchema: loginSchema,
        onSubmit: async values => {
            await auth.login(values.email, values.password)

            const next = params.get("next")
            const target = next && next.startsWith("/dashboard") ? next : "/dashboard"

            router.replace(target)
            router.refresh()
        },
    })

    return (
        <div className="admin-auth">
            <form className="admin-auth__card" onSubmit={form.handleSubmit} noValidate>
                <div className="admin-auth__mark" aria-hidden="true">
                    {APP_INITIALS}
                </div>

                <h1 className="admin-auth__title">Welcome back</h1>
                <p className="admin-auth__sub">
                    Sign in to manage the profile, projects and inbox of {APP_NAME}.
                </p>

                <div className="admin-stack" style={{ gap: "0.95rem" }}>
                    <Field label="Email" htmlFor="email" error={form.errors.email} required>
                        <TextInput
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={form.values.email}
                            invalid={Boolean(form.errors.email)}
                            onChange={event => form.setValue("email", event.target.value)}
                        />
                    </Field>

                    <Field label="Password" htmlFor="password" error={form.errors.password} required>
                        <div className="relative">
                            <TextInput
                                id="password"
                                type={revealPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={form.values.password}
                                invalid={Boolean(form.errors.password)}
                                className="pr-11"
                                onChange={event => form.setValue("password", event.target.value)}
                            />
                            <button
                                type="button"
                                className="admin-btn admin-btn--ghost admin-btn--icon absolute right-1 top-1/2 -translate-y-1/2"
                                style={{ minHeight: 34, width: 34 }}
                                onClick={() => setRevealPassword(value => !value)}
                                aria-label={revealPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                <Icon name={revealPassword ? "eyeOff" : "eye"} size={15} />
                            </button>
                        </div>
                    </Field>

                    <FormAlert message={form.errors.form} />

                    <Button
                        type="submit"
                        icon="lock"
                        loading={form.isSubmitting}
                        className="w-full"
                        style={{ justifyContent: "center" }}
                    >
                        Sign in
                    </Button>

                    {process.env.NODE_ENV !== "production" ? (
                        <p className="admin-hint text-center">
                            Seeded account: <code>admin@portfolio.local</code> /{" "}
                            <code>Admin12345</code>
                        </p>
                    ) : null}
                </div>
            </form>
        </div>
    )
}

/** Sign-in errors are expected, so never surface the generic error boundary. */
const LoginScreen = () => (
    <LoginForm />
)

export { LoginForm, LoginScreen }
export default LoginForm

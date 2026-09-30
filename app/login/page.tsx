import type { Metadata } from "next"
import { redirect } from "next/navigation"
import getSession from "@/lib/session"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign in to the portfolio content manager.",
}

const LoginPage = async () => {
    // The middleware covers this too, but a direct server render should never
    // show the form to an authenticated user.
    if (await getSession()) redirect("/dashboard")

    return <LoginForm />
}

export default LoginPage

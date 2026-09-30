import { redirect } from "next/navigation"
import getSession from "@/lib/session"
import AppProviders from "@/components/providers/app-providers"
import DashboardShell from "@/components/layout/DashboardShell"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession()

    // No/invalid cookie (or the API is down): start again from the sign-in page.
    if (!session) redirect("/login")

    return (
        <AppProviders user={session.user}>
            <DashboardShell>{children}</DashboardShell>
        </AppProviders>
    )
}

export default DashboardLayout

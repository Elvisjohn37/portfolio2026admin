import type { Metadata } from "next"
import AccountView from "@/components/account/AccountView"

export const metadata: Metadata = {
    title: "Settings",
    description: "Your name, sign-in email and password for the portfolio admin panel.",
}

const AccountPage = () => <AccountView />

export default AccountPage

import type { Metadata } from "next"
import ProfileView from "@/components/profile/ProfileView"

export const metadata: Metadata = {
    title: "Profile",
    description: "Hero, bio and contact details shown across the public portfolio.",
}

const ProfilePage = () => <ProfileView />

export default ProfilePage

import type { Metadata } from "next"
import TeamView from "@/components/team/TeamView"

export const metadata: Metadata = {
    title: "Team",
    description: "Admin accounts that can sign in to this panel.",
}

/** Administrators only - the API answers 403 for every other role. */
const TeamPage = () => <TeamView />

export default TeamPage
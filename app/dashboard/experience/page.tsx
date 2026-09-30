import type { Metadata } from "next"
import ExperienceView from "@/components/experience/ExperienceView"

export const metadata: Metadata = {
    title: "Work experience",
    description: "The timeline of roles shown on the portfolio.",
}

const ExperiencePage = () => <ExperienceView />

export default ExperiencePage

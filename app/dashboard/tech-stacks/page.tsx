import type { Metadata } from "next"
import TechStacksView from "@/components/tech-stacks/TechStacksView"

export const metadata: Metadata = {
    title: "Stack groups",
    description: "Frontend / Backend / Tools groups used by the About section.",
}

const TechStacksPage = () => <TechStacksView />

export default TechStacksPage

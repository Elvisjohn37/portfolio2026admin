import type { Metadata } from "next"
import AboutBlocksView from "@/components/about/AboutBlocksView"

export const metadata: Metadata = {
    title: "About blocks",
    description: "Skill blurbs shown per tech stack on the About page.",
}

const AboutBlocksPage = () => <AboutBlocksView />

export default AboutBlocksPage

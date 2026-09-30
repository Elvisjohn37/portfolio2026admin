import type { Metadata } from "next"
import ProjectsView from "@/components/projects/ProjectsView"

export const metadata: Metadata = {
    title: "Projects",
    description: "Project cards, galleries and technology stacks.",
}

/** `/dashboard/projects?edit=<id>` opens the form straight away (dashboard links). */
const ProjectsPage = async ({ searchParams }: { searchParams: Promise<{ edit?: string }> }) => {
    const { edit } = await searchParams

    return <ProjectsView editId={edit} />
}

export default ProjectsPage

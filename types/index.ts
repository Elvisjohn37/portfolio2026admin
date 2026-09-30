export type AdminUser = {
    _id: string
    name: string
    email: string
    role: "admin" | "editor"
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
    updatedAt: string
}

export type TeamRole = AdminUser["role"]

/** Every dashboard account is an admin user - see the Team screen. */
export type TeamMember = AdminUser

export type AboutProfile = {
    _id: string
    firstName: string
    middleName: string
    lastName: string
    position: string
    about1: string
    about2: string
    address: string
    province: string
    country: string
    degree: string
    school: string
    schoolYear: string
    avatar: string
    email: string
    phone: string
    github: string
    linkedin: string
    resumeUrl: string
    yearsOfExperience: number
    createdAt?: string
    updatedAt?: string
}

export type TechStackGroup = {
    _id: string
    techStack: string
    order: number
    usageCount?: number
    createdAt: string
    updatedAt: string
}

export type AboutBlock = {
    _id: string
    name: string
    description: string
    about: { _id: string; firstName: string; middleName?: string; lastName: string } | string
    techStack: { _id: string; techStack: string } | string
    order: number
    isPublished: boolean
    createdAt: string
    updatedAt: string
}

export type ProjectTechStacks = {
    frontend: string[]
    backend: string[]
    tools: string[]
}

export type Project = {
    _id: string
    name: string
    slug: string
    description: string
    info: string
    logoSrc: string
    thumbnail: string
    images: string[]
    url: string
    techStacks: ProjectTechStacks
    featured: boolean
    isPublished: boolean
    order: number
    createdAt: string
    updatedAt: string
}

export type WorkExperience = {
    _id: string
    title: string
    company: string
    start: string
    startDate: string
    end: string
    endDate: string
    focus: string
    highlights: string[]
    skills: string[]
    projects: { _id: string; name: string; slug?: string; thumbnail?: string; url?: string }[] | string[]
    order: number
    isPublished: boolean
    current?: boolean
    createdAt: string
    updatedAt: string
}

export type MessageStatus = "new" | "read" | "replied" | "archived"

export type ContactMessage = {
    _id: string
    name: string
    email: string
    subject: string
    message: string
    status: MessageStatus
    starred: boolean
    repliedAt: string | null
    source: string
    createdAt: string
    updatedAt: string
}

export type Pagination = {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
}

export type DashboardStats = {
    projects: number
    publishedProjects: number
    drafts: number
    experiences: number
    techStacks: number
    aboutBlocks: number
    profiles: number
    messages: number
    unreadMessages: number
    starredMessages: number
}

export type DashboardSummary = {
    stats: DashboardStats
    recentMessages: ContactMessage[]
    latestProjects: Pick<Project, "_id" | "name" | "slug" | "thumbnail" | "updatedAt" | "isPublished">[]
}

export type MessageStats = {
    total: number
    unread: number
    starred: number
    replied: number
}

export type ApiEnvelope<T> = {
    message: string
    data: T
    success: boolean
    errors?: Record<string, string>
}

/** Shared by the admin UI and Next's media rewrite configuration. */
export const PORTFOLIO_URL = (
    process.env.NEXT_PUBLIC_PORTFOLIO_URL?.trim() ||
    (process.env.NODE_ENV === "production"
        ? "https://elvisportfolio2026.netlify.app"
        : "http://localhost:3000")
).replace(/\/+$/, "")

/** Database media paths belong to the public portfolio, not the admin app. */
export function portfolioMediaUrl(path: string) {
    const value = path.trim()
    if (!value) return ""
    if (/^https?:\/\//i.test(value)) return value
    return new URL(value.replace(/^\/+/, ""), `${PORTFOLIO_URL}/`).href
}

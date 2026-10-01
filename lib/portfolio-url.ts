/** Shared by the admin UI and Next's media rewrite configuration. */
export const PORTFOLIO_URL = (
    process.env.NEXT_PUBLIC_PORTFOLIO_URL?.trim() ||
    (process.env.NODE_ENV === "production"
        ? "https://elvisportfolio2026.netlify.app"
        : "http://localhost:3000")
).replace(/\/+$/, "")

/**
 * Public API origin, for previews rendered in the browser. `API_URL` in
 * `lib/constants.ts` stays server-only; image pickers run client-side, so they
 * need the `NEXT_PUBLIC_` variant.
 */
const API_URL = (
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080"
).replace(/\/+$/, "")

/** The API serves uploaded images from `/api/media/<24-hex id>` and nothing else. */
const MEDIA_PATH = /^\/api\/media\/[a-f0-9]{24}$/i

/**
 * Returns the `/api/media/<id>` path when `value` points at the API's image
 * endpoint, whatever origin it was stored with, or `""` when it points
 * anywhere else. Absolute values left over from an older admin build (e.g.
 * `http://localhost:8080/api/media/<id>`) are matched too, so previews keep
 * working for images uploaded before the switch to relative paths.
 */
const mediaPath = (value: string): string => {
    try {
        // Relative values resolve against a throwaway base; for absolute ones
        // the parsed pathname drops the origin we deliberately discard.
        const { pathname } = new URL(value, "http://placeholder.invalid")

        return MEDIA_PATH.test(pathname) ? pathname : ""
    } catch {
        return ""
    }
}

/**
 * Resolves any stored image value to a URL the browser can load.
 *
 * Uploaded media is stored as an API-relative path (`/api/media/<id>`) and is
 * served by the API, while static assets (`/projects/…`) belong to the public
 * portfolio. Absolute URLs are passed through untouched.
 */
export function mediaUrl(path: string) {
    const value = path.trim()
    if (!value) return ""

    const media = mediaPath(value)
    if (media) return `${API_URL}${media}`

    if (/^https?:\/\//i.test(value)) return value

    return new URL(value.replace(/^\/+/, ""), `${PORTFOLIO_URL}/`).href
}

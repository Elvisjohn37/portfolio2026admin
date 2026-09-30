import { cookies } from "next/headers"
import { API_URL, TOKEN_COOKIE } from "./constants"
import type { AdminUser } from "@/types"

export type Session = {
    user: AdminUser
    token: string
}

/**
 * Server-side session lookup. Reads the httpOnly cookie, asks the API who the
 * token belongs to and returns `null` when the session is missing/expired.
 * Used by the dashboard layout and the `/api/auth/session` route.
 */
const getSession = async (): Promise<Session | null> => {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value

    if (!token) return null

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        })

        if (!response.ok) return null

        const payload = await response.json()

        if (!payload?.success || !payload?.data?.user) return null

        return { user: payload.data.user as AdminUser, token }
    } catch {
        // The API being unreachable must not crash the shell.
        return null
    }
}

export { getSession }
export default getSession

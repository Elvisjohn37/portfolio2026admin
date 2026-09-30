import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_URL, TOKEN_COOKIE } from "@/lib/constants"
import getSession from "@/lib/session"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/logout - clears the httpOnly cookie. Tokens are stateless so
 * dropping the cookie is enough; the API call is best-effort.
 */
const POST = async () => {
    const session = await getSession()

    if (session) {
        await fetch(process.env.API_URL ? `${process.env.API_URL}/api/auth/logout` : "", {
            method: "POST",
            headers: { authorization: `Bearer ${session.token}` },
            cache: "no-store",
        }).catch(() => undefined)
    }

    const store = await cookies()
    store.delete(TOKEN_COOKIE)

    return NextResponse.json({ message: "Signed out", data: {}, success: true })
}

export { POST }

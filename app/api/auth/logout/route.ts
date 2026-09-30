import { NextResponse } from "next/server"
import { TOKEN_COOKIE } from "@/lib/constants"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/logout - clears the httpOnly cookie. Tokens are stateless so
 * dropping the cookie is enough and must not depend on API availability.
 */
const POST = async () => {
    const response = NextResponse.json(
        { message: "Signed out", data: {}, success: true },
        { headers: { "Cache-Control": "no-store" } },
    )
    response.cookies.set(TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    })
    return response
}

export { POST }

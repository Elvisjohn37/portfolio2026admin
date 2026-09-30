import { NextResponse, type NextRequest } from "next/server"
import { TOKEN_COOKIE } from "@/lib/constants"

/**
 * Cheap gate: it only checks that a session cookie exists (never the database).
 * Real verification happens in `lib/session.ts` on every server render and in
 * the API itself. The login page verifies cookies before redirecting so stale
 * sessions can return to the sign-in form without a redirect loop.
 */
const middleware = (request: NextRequest) => {
    const { pathname, search } = request.nextUrl
    const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value)

    if (pathname.startsWith("/dashboard") && !hasSession) {
        const url = new URL("/login", request.url)

        url.searchParams.set("next", `${pathname}${search}`)

        return NextResponse.redirect(url)
    }

    // LoginPage verifies the session before redirecting. Cookie presence alone
    // would bounce expired sessions between /login and /dashboard forever.

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/"],
}

export { middleware }

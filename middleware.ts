import { NextResponse, type NextRequest } from "next/server"
import { TOKEN_COOKIE } from "@/lib/constants"

/**
 * Cheap gate: it only checks that a session cookie exists (never the database).
 * Real verification happens in `lib/session.ts` on every server render and in
 * the API itself, so a stale cookie simply results in a redirect loop back to
 * the sign-in screen rather than a privileged page.
 */
const middleware = (request: NextRequest) => {
    const { pathname, search } = request.nextUrl
    const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value)

    if (pathname.startsWith("/dashboard") && !hasSession) {
        const url = new URL("/login", request.url)

        url.searchParams.set("next", `${pathname}${search}`)

        return NextResponse.redirect(url)
    }

    if ((pathname === "/" || pathname === "/login") && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/"],
}

export { middleware }

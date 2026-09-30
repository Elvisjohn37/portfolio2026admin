import { NextRequest, NextResponse } from "next/server"
import { API_URL, TOKEN_COOKIE } from "@/lib/constants"

export const dynamic = "force-dynamic"
export const revalidate = 0

type RouteContext = {
    params: Promise<{ path: string[] }>
}

const HOP_BY_HOP = new Set([
    "content-encoding",
    "content-length",
    "connection",
    "keep-alive",
    "transfer-encoding",
    "date",
    "set-cookie",
])

/**
 * BFF proxy: `/api/proxy/projects/manage?page=1` →
 * `${API_URL}/api/projects/manage?page=1`, with the JWT from the httpOnly
 * cookie injected as an Authorization header. The browser never sees the token.
 */
const forward = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const { path = [] } = await context.params
    const target = new URL(`${API_URL}/api/${path.join("/")}`)

    target.search = request.nextUrl.search

    const token = request.cookies.get(TOKEN_COOKIE)?.value
    const headers = new Headers()
    const contentType = request.headers.get("content-type")

    if (contentType) headers.set("content-type", contentType)
    if (token) headers.set("authorization", `Bearer ${token}`)

    const method = request.method.toUpperCase()
    const hasBody = method !== "GET" && method !== "HEAD"
    const body = hasBody ? await request.arrayBuffer() : undefined

    let upstream: Response

    try {
        upstream = await fetch(target, {
            method,
            headers,
            body,
            cache: "no-store",
            // Body was already consumed above; keep the request as-is.
            redirect: "manual",
        } as RequestInit)
    } catch {
        return NextResponse.json(
            {
                message: "Cannot reach the portfolio API - is the backend running?",
                data: {},
                success: false,
            },
            { status: 502 },
        )
    }

    const payload = await upstream.arrayBuffer()
    const responseHeaders = new Headers()

    upstream.headers.forEach((value, key) => {
        if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, value)
    })

    const upstreamContentType = upstream.headers.get("content-type")
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType)

    const response = new NextResponse(payload, {
        status: upstream.status,
        headers: responseHeaders,
    })

    // Expired/invalid token: drop the cookie so the middleware can redirect.
    if (upstream.status === 401 && token) {
        response.cookies.delete(TOKEN_COOKIE)
    }

    return response
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE }

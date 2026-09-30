import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_URL, SESSION_MAX_AGE_SECONDS, TOKEN_COOKIE } from "@/lib/constants"
import type { AdminUser, ApiEnvelope } from "@/types"

export const dynamic = "force-dynamic"

const isProduction = process.env.NODE_ENV === "production"

/**
 * POST /api/auth/login (admin app).
 *
 * Exchanges credentials for a JWT and stores it in an httpOnly cookie, so the
 * token never touches JavaScript on the client. The response only carries the
 * safe user object.
 */
const POST = async (request: NextRequest) => {
    const credentials = await request.json().catch(() => ({}))

    let upstream: Response

    try {
        upstream = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                email: String((credentials as { email?: string }).email ?? "").trim(),
                password: String((credentials as { password?: string }).password ?? ""),
            }),
            cache: "no-store",
        })
    } catch {
        return NextResponse.json(
            {
                message: "Cannot reach the portfolio API - please try again shortly",
                data: {},
                success: false,
            },
            { status: 502 },
        )
    }

    const payload = (await upstream.json().catch(() => null)) as
        | ApiEnvelope<{ token: string; user: AdminUser }>
        | null

    if (!upstream.ok || !payload?.success || !payload.data?.token) {
        return NextResponse.json(
            {
                message: payload?.message ?? "Sign in failed",
                data: {},
                success: false,
                ...(payload?.errors ? { errors: payload.errors } : {}),
            },
            { status: upstream.status === 200 ? 401 : upstream.status },
        )
    }

    const store = await cookies()

    store.set(TOKEN_COOKIE, payload.data.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return NextResponse.json({
        message: payload.message,
        data: { user: payload.data.user },
        success: true,
    })
}

export { POST }

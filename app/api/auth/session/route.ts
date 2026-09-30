import { NextResponse } from "next/server"
import getSession from "@/lib/session"

export const dynamic = "force-dynamic"

/** GET /api/auth/session - who am I? (used by client components that need it). */
const GET = async () => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            { message: "Not signed in", data: {}, success: false },
            { status: 401 },
        )
    }

    return NextResponse.json({
        message: "",
        data: { user: session.user },
        success: true,
    })
}

export { GET }

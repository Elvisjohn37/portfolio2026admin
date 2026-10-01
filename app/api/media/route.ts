import { NextRequest, NextResponse } from "next/server"
import getSession from "@/lib/session"
import { API_URL } from "@/lib/constants"

export const runtime = "nodejs"
const limit = 3 * 1024 * 1024
const fail = (status: number, message: string) => NextResponse.json({ success: false, message }, { status })

export async function POST(request: NextRequest) {
    if (request.headers.get("origin") !== request.nextUrl.origin) return fail(403, "Invalid upload origin")
    const session = await getSession()
    if (!session) return fail(401, "Please sign in again to upload images.")
    if (Number(request.headers.get("content-length")) > limit) return fail(413, "Each image must be 3 MB or smaller.")
    const reader = request.body?.getReader()
    if (!reader) return fail(400, "Choose an image.")
    try {
        const chunks: Uint8Array[] = []
        let size = 0
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            size += value.length
            if (size > limit) { await reader.cancel(); return fail(413, "Each image must be 3 MB or smaller.") }
            chunks.push(value)
        }
        if (!size) return fail(400, "The selected image is empty.")
        const response = await fetch(`${API_URL.replace(/\/+$/, "")}/api/media`, {
            method: "POST", headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/octet-stream" },
            body: Buffer.concat(chunks), signal: AbortSignal.timeout(25000),
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) return fail(response.status, payload?.message ?? "Image upload failed. Please retry.")
        if (!/^\/api\/media\/[a-f0-9]{24}$/i.test(payload?.data?.path ?? "")) return fail(502, "Invalid upload response")
        // The project document stores this relative path, never an absolute URL.
        // Baking the origin in here would tie every upload to whichever API the
        // admin was pointed at, so images uploaded on localhost would 404 for
        // visitors of the deployed portfolio. Each app resolves the path against
        // the API it actually talks to (see `app/utils/js/media.ts`).
        return NextResponse.json({ success: true, data: { path: payload.data.path } }, { status: 201 })
    } catch { return fail(502, "Image upload failed. Please retry.") }
}

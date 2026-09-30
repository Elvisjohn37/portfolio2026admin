import type { ApiEnvelope, Pagination, TeamMember, TeamRole } from "@/types"
import type { ChangePasswordValues } from "@/lib/validation/schemas"

/** Thrown by every request helper; carries field errors from yup on the API. */
export class ApiError extends Error {
    status: number
    errors: Record<string, string>

    constructor(message: string, status = 500, errors: Record<string, string> = {}) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.errors = errors
    }

    get isUnauthorized() {
        return this.status === 401
    }
}

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
    /** Query string parameters; empty values are dropped. */
    query?: Record<string, string | number | boolean | undefined | null>
}

const buildQuery = (query?: RequestOptions["query"]) => {
    if (!query) return ""

    const params = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        params.set(key, String(value))
    })

    const serialized = params.toString()
    return serialized ? `?${serialized}` : ""
}

/**
 * Every call goes through the Next.js BFF proxy (`/api/proxy/*`), which reads
 * the httpOnly cookie and forwards the JWT to the Express API. The token is
 * therefore never reachable from browser JavaScript.
 */
const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { method = "GET", body, query } = options
    const url = `/api/proxy/${path.replace(/^\/+/, "")}${buildQuery(query)}`

    let response: Response

    try {
        response = await fetch(url, {
            method,
            headers: body === undefined ? undefined : { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
            cache: "no-store",
        })
    } catch {
        throw new ApiError("Network error - please check your connection", 0)
    }

    const raw = await response.text()
    let payload: ApiEnvelope<T> | null = null

    try {
        payload = raw ? (JSON.parse(raw) as ApiEnvelope<T>) : null
    } catch {
        payload = null
    }

    if (!response.ok || !payload?.success) {
        throw new ApiError(
            payload?.message || `Request failed with status ${response.status}`,
            response.status,
            payload?.errors ?? {},
        )
    }

    return payload.data
}

const api = {
    get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { query }),
    post: <T>(path: string, body?: unknown, query?: RequestOptions["query"]) =>
        request<T>(path, { method: "POST", body, query }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

/** Default SWR fetcher: `useSWR(["projects/manage", query], swrFetcher)`. */
const swrFetcher = <T>([path, query]: [string, RequestOptions["query"]?]) =>
    api.get<T>(path, query)

export { api, swrFetcher, request }

/**
 * Endpoints handled by the Next.js server itself (they set/clear the httpOnly
 * cookie), so they bypass the `/api/proxy` prefix.
 */
const authRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    let response: Response

    try {
        response = await fetch(`/api/auth/${path}`, {
            ...init,
            headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
            cache: "no-store",
        })
    } catch {
        throw new ApiError("Network error - please check your connection", 0)
    }

    const raw = await response.text()
    let payload: ApiEnvelope<T> | null = null

    try {
        payload = raw ? (JSON.parse(raw) as ApiEnvelope<T>) : null
    } catch {
        payload = null
    }

    if (!response.ok || !payload?.success) {
        throw new ApiError(
            payload?.message || `Request failed with status ${response.status}`,
            response.status,
            payload?.errors ?? {},
        )
    }

    return payload.data
}

const auth = {
    login: (email: string, password: string) =>
        authRequest<{ user: import("@/types").AdminUser }>("login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),
    logout: () => authRequest<{ message: string }>("logout", { method: "POST" }),
    session: () => authRequest<{ user: import("@/types").AdminUser }>("session"),
}

export { auth }

/**
 * `PUT /api/auth/profile` is validated with `profileSchema`, the same schema the
 * Team endpoints use, where role/isActive are defaulted. The account screen must
 * therefore send them back untouched - see `AccountView`.
 */
export type AccountProfilePayload = {
    name: string
    email: string
    role: TeamRole
    isActive: boolean
}

export type ChangePasswordPayload = ChangePasswordValues & Record<string, never>

/** Both endpoints answer with the fresh account so the shell can refresh itself. */
const account = {
    updateProfile: (body: AccountProfilePayload) =>
        api.put<{ user: TeamMember }>("auth/profile", body),
    changePassword: (body: {
        currentPassword: string
        password: string
        passwordConfirmation: string
    }) => api.put<{ user: TeamMember }>("auth/password", body),
}

export { account }

/* ----------------------------------- team ----------------------------------- */

/**
 * Team management lives on the API under `/api/auth/users` and is admin-only
 * there (`requireRole("admin")`). Calls still travel through the BFF proxy so
 * the JWT stays in the httpOnly cookie.
 */
export type TeamMemberCreatePayload = {
    name: string
    email: string
    role: TeamRole
    isActive: boolean
    password: string
}

/** The API validates updates with `profileSchema`, which has no password. */
export type TeamMemberUpdatePayload = Omit<TeamMemberCreatePayload, "password">

const team = {
    /** Same call `useList({ path: "auth/users" })` performs through `swrFetcher`. */
    list: (query?: RequestOptions["query"]) =>
        api.get<{ users: TeamMember[]; pagination: Pagination }>("auth/users", query),
    create: (body: TeamMemberCreatePayload) => api.post<{ user: TeamMember }>("auth/users", body),
    update: (id: string, body: TeamMemberUpdatePayload) =>
        api.put<{ user: TeamMember }>(`auth/users/${id}`, body),
    remove: (id: string) => api.delete<{ _id: string }>(`auth/users/${id}`),
}

export { team }

export default api

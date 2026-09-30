"use client"

import { useRouter } from "next/navigation"
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react"
import useSWR, { SWRConfig } from "swr"
import api, { swrFetcher } from "@/lib/api"
import type { AdminUser } from "@/types"

type AuthContextValue = {
    user: AdminUser
    isAdmin: boolean
    /** Keeps the shell (avatar, topbar title) in sync after `/auth/profile`. */
    updateUser: (user: AdminUser) => void
    logout: () => Promise<void>
}


const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Unread message count, shown as a badge in the sidebar.
 * Keys are `[path, query]` tuples - see `swrFetcher` in lib/api.ts.
 */
const useUnreadMessages = (enabled: boolean) => {
    const { data } = useSWR<{ unread: number }>(enabled ? ["messages/stats"] : null, {
        refreshInterval: 60000,
    })

    return data?.unread ?? 0
}

/**
 * Wraps the signed-in area. The user object is rendered on the server (see the
 * dashboard layout) and hydrated here so the first paint is never empty.
 */
const AuthProvider = ({
    user,
    children,
}: {
    user: AdminUser
    children: ReactNode
}) => {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<AdminUser>(user)

    const logout = useCallback(async () => {
        try {
            await api.post("auth/logout")
        } finally {
            window.localStorage.removeItem("portfolio-admin-theme")
            router.replace("/login")
            router.refresh()
        }
    }, [router])

    const updateUser = useCallback((next: AdminUser) => setCurrentUser(next), [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user: currentUser,
            isAdmin: currentUser.role === "admin",
            updateUser,
            logout,
        }),
        [currentUser, logout, updateUser],
    )


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) throw new Error("useAuth must be used inside <AuthProvider>")

    return context
}

/** Global SWR defaults + every client context in one place. */
const AppProviders = ({
    user,
    children,
}: {
    user: AdminUser
    children: ReactNode
}) => (
    <SWRConfig
        value={{
            fetcher: swrFetcher,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            errorRetryCount: 0,
        }}
    >
        <AuthProvider user={user}>{children}</AuthProvider>
    </SWRConfig>
)

export { AuthProvider, AppProviders, useAuth, useUnreadMessages }
export default AppProviders

"use client"

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"
import cls from "classnames"
import { Icon } from "@/components/ui/Icons"

type ToastTone = "success" | "error" | "info"

type Toast = {
    id: number
    tone: ToastTone
    title: string
    description?: string
}

type ToastContextValue = {
    toast: (input: { tone?: ToastTone; title: string; description?: string }) => void
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const TIMEOUT = 4200

const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])
    const counter = useRef(0)

    const dismiss = useCallback((id: number) => {
        setToasts(current => current.filter(item => item.id !== id))
    }, [])

    const toast = useCallback<ToastContextValue["toast"]>(
        ({ tone = "info", title, description }) => {
            counter.current += 1
            const id = counter.current

            setToasts(current => [...current.slice(-3), { id, tone, title, description }])
            window.setTimeout(() => dismiss(id), TIMEOUT)
        },
        [dismiss],
    )

    const value = useMemo<ToastContextValue>(
        () => ({
            toast,
            success: (title, description) => toast({ tone: "success", title, description }),
            error: (title, description) => toast({ tone: "error", title, description }),
        }),
        [toast],
    )

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="admin-toaster" role="status" aria-live="polite">
                {toasts.map(item => (
                    <div
                        key={item.id}
                        className={cls("admin-toast", `admin-toast--${item.tone}`)}
                    >
                        <span
                            className={cls(item.tone === "success" && "text-[var(--success)]",
                                item.tone === "error" && "text-[var(--danger)]",
                                item.tone === "info" && "text-[var(--info)]")}
                        >
                            <Icon
                                name={item.tone === "success" ? "check" : item.tone === "error" ? "alert" : "info"}
                                size={17}
                            />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="admin-toast__title">{item.title}</p>
                            {item.description ? (
                                <p className="admin-toast__text">{item.description}</p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            className="admin-btn admin-btn--ghost admin-btn--icon"
                            style={{ minHeight: 28, width: 28 }}
                            onClick={() => dismiss(item.id)}
                            aria-label="Dismiss notification"
                        >
                            <Icon name="close" size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

const useToast = () => {
    const context = useContext(ToastContext)

    if (!context) throw new Error("useToast must be used inside <ToastProvider>")

    return context
}

export { ToastProvider, useToast }
export default ToastProvider

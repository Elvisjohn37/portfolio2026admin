"use client"

import { useEffect, useRef, type ReactNode } from "react"
import cls from "classnames"
import { Icon } from "@/components/ui/Icons"

type ModalProps = {
    open: boolean
    title: string
    description?: string
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
    size?: "md" | "wide"
}

/**
 * Dialog with a blurred scrim, Escape-to-close and outside-click handling.
 * Rendered inline (no portal) - the shell has no stacking contexts above it.
 */
const Modal = ({
    open,
    title,
    description,
    onClose,
    children,
    footer,
    size = "md",
}: ModalProps) => {
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return undefined

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }

        document.addEventListener("keydown", onKeyDown)

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus()

        return () => {
            document.removeEventListener("keydown", onKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="admin-modal"
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cls("admin-modal__panel", size === "wide" && "admin-modal__panel--wide")}
            >
                <div className="admin-modal__head">
                    <div className="min-w-0">
                        <h2 className="admin-modal__title">{title}</h2>
                        {description ? (
                            <p className="admin-modal__sub">{description}</p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--icon"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <Icon name="close" size={16} />
                    </button>
                </div>

                <div className="admin-modal__body">{children}</div>

                {footer ? <div className="admin-modal__foot">{footer}</div> : null}
            </div>
        </div>
    )
}

export { Modal }
export default Modal

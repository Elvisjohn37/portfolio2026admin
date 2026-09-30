"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/providers/toast-provider"
import api, { ApiError } from "@/lib/api"

type ConfirmModalProps = {
    open: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
    itemLabel?: string
}

/** Generic destructive-action dialog with the API error surfaced inline. */
const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Delete",
    itemLabel,
}: ConfirmModalProps) => {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const toast = useToast()

    const handleConfirm = async () => {
        setBusy(true)
        setError(null)

        try {
            await onConfirm()
            toast.success(itemLabel ? `${itemLabel} deleted` : "Deleted")
            onClose()
        } catch (cause) {
            const message =
                cause instanceof ApiError ? cause.message : "Something went wrong - please try again"

            setError(message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal
            open={open}
            title={title}
            description={description}
            onClose={busy ? () => undefined : onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button variant="danger" icon="trash" loading={busy} onClick={handleConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {error ? <div className="admin-alert admin-alert--danger">{error}</div> : null}
            <p className="admin-muted text-sm leading-relaxed">
                This cannot be undone.
            </p>
        </Modal>
    )
}

/** Small helper so pages can reuse the same DELETE + toast flow. */
const deleteResource = async (path: string) => {
    await api.delete(path)
}

export { ConfirmModal, deleteResource }
export default ConfirmModal

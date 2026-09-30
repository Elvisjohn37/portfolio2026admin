"use client"

import Button from "@/components/ui/Button"
import { Icon, type IconName } from "@/components/ui/Icons"

type Action = {
    icon: IconName
    label: string
    onClick: () => void
    danger?: boolean
    loading?: boolean
}

/** The edit / extra / delete cluster on every table row. */
const RowActions = ({
    onEdit,
    onDelete,
    extra,
    editLabel = "Edit",
    deleteLabel = "Delete",
    busy,
}: {
    onEdit: () => void
    onDelete: () => void
    extra?: Action
    editLabel?: string
    deleteLabel?: string
    busy?: boolean
}) => (
    <div className="admin-actions">
        <Button
            variant="ghost"
            size="icon"
            icon="edit"
            aria-label={editLabel}
            title={editLabel}
            disabled={busy}
            onClick={onEdit}
        />
        {extra ? (
            <Button
                variant="ghost"
                size="icon"
                icon={extra.icon}
                aria-label={extra.label}
                title={extra.label}
                loading={extra.loading}
                onClick={extra.onClick}
            />
        ) : null}
        <Button
            variant="danger"
            size="icon"
            icon="trash"
            aria-label={deleteLabel}
            title={deleteLabel}
            disabled={busy}
            onClick={onDelete}
        />
    </div>
)

export { RowActions, Icon }
export default RowActions

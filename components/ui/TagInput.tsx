"use client"

import { useState, type KeyboardEvent } from "react"
import cls from "classnames"
import { Icon } from "@/components/ui/Icons"

type TagInputProps = {
    id: string
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    /** Enter / comma / Tab confirm the pending entry; Backspace removes the last. */
    max?: number
    invalid?: boolean
}

/** Chip editor used for tech stacks, skills, highlight bullets, image lists. */
const TagInput = ({
    id,
    value,
    onChange,
    placeholder = "Type and press Enter",
    max = 60,
    invalid,
}: TagInputProps) => {
    const [draft, setDraft] = useState("")

    const commit = (raw: string) => {
        const entry = raw.trim()

        if (!entry) return
        if (value.some(item => item.toLowerCase() === entry.toLowerCase())) {
            setDraft("")
            return
        }

        onChange([...value, entry])
        setDraft("")
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
            if (!draft.trim()) return
            event.preventDefault()
            commit(draft)
            return
        }

        if (event.key === "Backspace" && !draft && value.length) {
            event.preventDefault()
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div
            className={cls("admin-tags", invalid && "border-[var(--danger)]")}
            onClick={event => {
                if (event.currentTarget === event.target) {
                    document.getElementById(id)?.focus()
                }
            }}
        >
            {value.map((item, index) => (
                <span className="admin-tag" key={`${item}-${index}`}>
                    {item}
                    <button
                        type="button"
                        className="admin-tag__remove"
                        aria-label={`Remove ${item}`}
                        onClick={() =>
                            onChange(value.filter((_, position) => position !== index))
                        }
                    >
                        <Icon name="close" size={12} strokeWidth={2.4} />
                    </button>
                </span>
            ))}

            <input
                id={id}
                name={id}
                className="admin-tags__input"
                value={draft}
                placeholder={value.length >= max ? "Limit reached" : placeholder}
                disabled={value.length >= max}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => commit(draft)}
            />
        </div>
    )
}

export { TagInput }
export default TagInput

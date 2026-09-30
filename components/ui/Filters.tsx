"use client"

import { useEffect, useState } from "react"
import cls from "classnames"
import { Icon } from "@/components/ui/Icons"

type SearchInputProps = {
    value: string
    /** Called ~350ms after typing stops (and immediately on clear/Enter). */
    onChange: (value: string) => void
    placeholder?: string
    autoFocus?: boolean
}

const SearchInput = ({ value, onChange, placeholder = "Search…", autoFocus }: SearchInputProps) => {
    const [draft, setDraft] = useState(value)

    // Keep the field in sync when the value is changed elsewhere (back button,
    // reset filters, etc).
    useEffect(() => setDraft(value), [value])

    useEffect(() => {
        if (draft === value) return undefined

        const timer = window.setTimeout(() => onChange(draft), 350)

        return () => window.clearTimeout(timer)
    }, [draft, value, onChange])

    return (
        <div className="admin-search">
            <span className="admin-search__icon">
                <Icon name="search" size={15} />
            </span>
            <input
                type="search"
                className="admin-input"
                value={draft}
                placeholder={placeholder}
                autoFocus={autoFocus}
                aria-label={placeholder}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault()
                        onChange(draft)
                    }
                }}
            />
        </div>
    )
}

type FilterOption = { value: string; label: string; count?: number }

type FilterChipsProps = {
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
    label?: string
}

const FilterChips = ({ value, options, onChange, label }: FilterChipsProps) => (
    <div className="admin-chips" role="group" aria-label={label}>
        {options.map(option => (
            <button
                key={option.value}
                type="button"
                className={cls("admin-chip", value === option.value && "is-active")}
                aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
            >
                {option.label}
                {typeof option.count === "number" ? (
                    <span className="admin-chip__count">{option.count}</span>
                ) : null}
            </button>
        ))}
    </div>
)

export { SearchInput, FilterChips }

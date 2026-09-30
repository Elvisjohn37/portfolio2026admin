"use client"

import cls from "classnames"
import { Icon } from "@/components/ui/Icons"
import { useTheme } from "@/components/providers/theme-provider"

/** Dark/light switch - persists to localStorage via the theme provider. */
const ThemeToggle = ({ className }: { className?: string }) => {
    const { theme, toggleTheme } = useTheme()
    const next = theme === "dark" ? "light" : "dark"

    return (
        <button
            type="button"
            className={cls("admin-btn admin-btn--ghost admin-btn--icon", className)}
            onClick={toggleTheme}
            aria-label={`Switch to ${next} theme`}
            title={`Switch to ${next} theme`}
        >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
        </button>
    )
}

export { ThemeToggle }
export default ThemeToggle

"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"

type Theme = "dark" | "light"

type ThemeContextValue = {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const STORAGE_KEY = "portfolio-admin-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

const readStoredTheme = (): Theme => {
    if (typeof window === "undefined") return "dark"
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === "light" || stored === "dark" ? stored : "dark"
}

/**
 * Mirrors the public portfolio's theming approach: a `data-theme` attribute on
 * <html> drives the CSS custom properties declared in globals.css.
 */
const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>("dark")

    useEffect(() => {
        const stored = readStoredTheme()
        setThemeState(stored)
        document.documentElement.setAttribute("data-theme", stored)
    }, [])

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next)
        document.documentElement.setAttribute("data-theme", next)
        window.localStorage.setItem(STORAGE_KEY, next)
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme(readStoredTheme() === "dark" ? "light" : "dark")
    }, [setTheme])

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const useTheme = () => {
    const context = useContext(ThemeContext)

    if (!context) throw new Error("useTheme must be used inside <ThemeProvider>")

    return context
}

export { ThemeProvider, useTheme }
export default ThemeProvider

import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/providers/theme-provider"
import ToastProvider from "@/components/providers/toast-provider"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: {
        default: "Portfolio Admin",
        template: "%s · Portfolio Admin",
    },
    description: "Content and inbox management for the portfolio2026 site.",
    robots: { index: false, follow: false },
    icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#060a15" },
        { media: "(prefers-color-scheme: light)", color: "#f5f8fc" },
    ],
}

/** Applies the stored theme before first paint to avoid a flash of dark UI. */
const THEME_BOOTSTRAP = `
try {
    var stored = localStorage.getItem("portfolio-admin-theme");
    document.documentElement.setAttribute("data-theme", stored === "light" ? "light" : "dark");
} catch (error) {
    document.documentElement.setAttribute("data-theme", "dark");
}
`

const RootLayout = ({ children }: { children: React.ReactNode }) => (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ThemeProvider>
                <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
        </body>
    </html>
)

export default RootLayout

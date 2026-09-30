"use client"

import { useState, type ReactNode } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

/**
 * Chrome shared by every dashboard page: fixed sidebar (drawer on mobile),
 * sticky topbar and the scrollable content column.
 */
const DashboardShell = ({ children }: { children: ReactNode }) => {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="admin-shell">
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

            <div className="admin-main">
                <Topbar onMenuClick={() => setMenuOpen(true)} />
                <main className="admin-content">{children}</main>
            </div>
        </div>
    )
}

export { DashboardShell }
export default DashboardShell

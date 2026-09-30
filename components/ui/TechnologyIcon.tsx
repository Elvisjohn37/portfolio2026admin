"use client"

import { useState } from "react"
import useSWR from "swr"

const CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest"
const AI_CATALOG = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/?meta"
type AiEntry = { title: string; url: string; monochrome: boolean }
const loadAiCatalog = async (url: string): Promise<AiEntry[]> => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error("AI catalog unavailable")
    const data = await response.json()
    if (!Array.isArray(data.files) || !/^\d+\.\d+\.\d+/.test(data.version)) throw new Error("Invalid AI catalog")
    const paths = new Set<string>(data.files.map((file: { path: string }) => file.path)
        .filter((path: unknown): path is string => typeof path === "string" && /^\/icons\/[a-z0-9-]+\.svg$/.test(path)))
    return [...paths].filter((path) => !/-(color|text|brand|wordmark)\.svg$/.test(path)).map((path) => {
        const colorPath = path.replace(/\.svg$/, "-color.svg")
        const colored = paths.has(colorPath)
        return {
            title: path.slice(7, -4),
            url: `https://unpkg.com/@lobehub/icons-static-svg@${encodeURIComponent(data.version)}${colored ? colorPath : path}`,
            monochrome: !colored,
        }
    })
}
const BRAND_CATALOG = "https://cdn.jsdelivr.net/npm/simple-icons@latest/data/simple-icons.json"
type BrandEntry = { title: string; slug: string; aliases?: { aka?: string[] } }
const loadBrands = async (url: string): Promise<BrandEntry[]> => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error("Brand catalog unavailable")
    const data = await response.json()
    if (!Array.isArray(data)) throw new Error("Invalid brand catalog")
    return data.filter((entry) => typeof entry.title === "string" && typeof entry.slug === "string")
}
type CatalogEntry = { name: string; altnames?: string[]; versions: { svg: string[] } }
const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9+#]/g, "")
const aliases: Record<string, string> = {
    openaicodex: "codex", codexcli: "codex", codexai: "codex",
    claudeai: "claude", anthropicclaude: "claude", claudecode: "claude",
    es6: "javascript", js: "javascript", ts: "typescript", html: "html5",
    css: "css3", materialui: "materialui", mui: "materialui", node: "nodejs",
    expressjs: "express", postgres: "postgresql", "c#": "csharp", "c++": "cplusplus",
}
const loadCatalog = async (url: string): Promise<CatalogEntry[]> => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error("Icon catalog unavailable")
    const data = await response.json()
    if (!Array.isArray(data)) throw new Error("Invalid icon catalog")
    return data.filter((entry) => typeof entry.name === "string" && Array.isArray(entry.versions?.svg))
}

export default function TechnologyIcon({ name, size = 48, preview = false }: {
    name: string; size?: number; preview?: boolean
}) {
    const { data, error, isLoading } = useSWR<CatalogEntry[]>(`${CDN}/devicon.json`, loadCatalog, {
        revalidateOnFocus: false, dedupingInterval: 3600000, errorRetryCount: 1,
    })
    const [failedUrl, setFailedUrl] = useState<string | null>(null)
    const normalized = normalize(name)
    const query = aliases[normalized] ?? normalized
    const match = data?.find((entry) => normalize(entry.name) === query ||
        entry.altnames?.some((alias) => normalize(alias) === query))
    const { data: brands, error: brandError, isLoading: brandsLoading } = useSWR<BrandEntry[]>(
        name.trim() && !isLoading && !match ? BRAND_CATALOG : null, loadBrands,
        { revalidateOnFocus: false, dedupingInterval: 3600000, errorRetryCount: 1 },
    )
    const brand = brands?.find((entry) => normalize(entry.slug) === query ||
        normalize(entry.title) === query || entry.aliases?.aka?.some((alias) => normalize(alias) === query))
    const { data: aiCatalog, error: aiError, isLoading: aiLoading } = useSWR<AiEntry[]>(
        name.trim() && !isLoading && !brandsLoading && !match && !brand ? AI_CATALOG : null,
        loadAiCatalog, { revalidateOnFocus: false, dedupingInterval: 3600000, errorRetryCount: 1 },
    )
    const aiIcon = aiCatalog?.find((entry) => normalize(entry.title) === query)
    const variant = match && (["original", "plain", "line"].find((value) => match.versions.svg.includes(value)) ?? match.versions.svg[0])
    const url = aiIcon?.url ?? (match && variant ? `${CDN}/icons/${encodeURIComponent(match.name)}/${encodeURIComponent(match.name)}-${encodeURIComponent(variant)}.svg`
        : brand ? `https://cdn.simpleicons.org/${encodeURIComponent(brand.slug)}` : null)
    const hasIcon = url && failedUrl !== url
    const status = !name.trim() ? "Enter a technology name to find its icon."
        : !hasIcon && (isLoading || brandsLoading || aiLoading) ? "Finding icon…"
        : hasIcon ? `Icon found: ${aiIcon?.title ?? match?.name ?? brand?.title}`
        : error || brandError || aiError ? "Icon catalog unavailable. Initials will be used."
        : "No available icon. Initials will be used."
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, maxWidth: "100%" }}>
            {hasIcon ? (
                // Remote catalog SVGs are displayed as images, never injected as markup.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={preview ? `${name} icon` : ""} width={size} height={size}
                    referrerPolicy="no-referrer" onError={() => setFailedUrl(url)}
                    style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, background: "#f8fafc", borderRadius: 10, padding: 5 }} />
            ) : (
                <span aria-hidden="true" style={{ width: size, height: size, display: "inline-grid", placeItems: "center", borderRadius: 10, background: "#e2e8f0", color: "#334155", fontWeight: 700, fontSize: size * 0.3, flexShrink: 0 }}>
                    {name.trim().slice(0, 2).toUpperCase() || "?"}
                </span>
            )}
            {preview && <span role="status" style={{ fontSize: "0.8rem", color: "var(--secondary-text)" }}>{status}</span>}
        </span>
    )
}

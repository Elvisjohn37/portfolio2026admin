const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
})

const toDate = (value?: string | Date | null) => {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value?: string | Date | null, fallback = "—") => {
    const date = toDate(value)
    return date ? DATE_FORMATTER.format(date) : fallback
}

const formatDateTime = (value?: string | Date | null, fallback = "—") => {
    const date = toDate(value)
    return date ? `${DATE_FORMATTER.format(date)} · ${TIME_FORMATTER.format(date)}` : fallback
}

const formatRelative = (value?: string | Date | null) => {
    const date = toDate(value)
    if (!date) return "—"

    const seconds = Math.round((Date.now() - date.getTime()) / 1000)
    const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
        [60, "second"],
        [60, "minute"],
        [24, "hour"],
        [7, "day"],
        [4.34524, "week"],
        [12, "month"],
        [Number.POSITIVE_INFINITY, "year"],
    ]

    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
    let duration = seconds

    for (const [amount, unit] of divisions) {
        if (Math.abs(duration) < amount) return formatter.format(-Math.round(duration), unit)
        duration /= amount
    }

    return formatDate(date)
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
    `${formatNumber(count)} ${count === 1 ? singular : plural}`

const initials = (value?: string) =>
    (value ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join("") || "?"

const truncate = (value: string, max = 120) =>
    value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`

/** Turns a title into a URL/file friendly slug (mirrors the API helper). */
const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

export {
    formatDate,
    formatDateTime,
    formatRelative,
    formatNumber,
    pluralize,
    initials,
    truncate,
    slugify,
}

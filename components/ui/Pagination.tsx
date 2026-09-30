"use client"

import cls from "classnames"
import { Icon } from "@/components/ui/Icons"
import { formatNumber } from "@/lib/format"
import type { Pagination as PaginationMeta } from "@/types"

type PaginationProps = {
    pagination?: PaginationMeta
    label?: string
    onPageChange: (page: number) => void
    extraActions?: React.ReactNode
}

/** Page window: 1 … (n-1) n (n+1) … last, always showing first/last. */
const pageWindow = (current: number, total: number) => {
    const pages = new Set<number>([1, total, current])

    ;[current - 1, current + 1].forEach(page => {
        if (page > 1 && page < total) pages.add(page)
    })

    return [...pages].sort((a, b) => a - b)
}

const Pagination = ({ pagination, label = "items", onPageChange, extraActions }: PaginationProps) => {
    if (!pagination) return null

    const { page, pages, total, hasPrev, hasNext } = pagination
    const from = total === 0 ? 0 : (page - 1) * pagination.limit + 1
    const to = Math.min(page * pagination.limit, total)

    return (
        <div className="admin-pagination">
            <div className="admin-row" style={{ gap: "0.75rem" }}>
                <span>
                    {total === 0
                        ? `No ${label}`
                        : `${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total)} ${label}`}
                </span>
                {extraActions}
            </div>

            {pages > 1 ? (
                <div className="admin-pagination__pages">
                    <button
                        type="button"
                        className="admin-pagination__page"
                        disabled={!hasPrev}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Previous page"
                    >
                        <Icon name="chevronLeft" size={15} />
                    </button>

                    {pageWindow(page, pages).map((item, index, list) => (
                        <span key={item} className="admin-row" style={{ gap: "0.35rem" }}>
                            {index > 0 && item - list[index - 1] > 1 ? (
                                <span className="admin-muted">…</span>
                            ) : null}
                            <button
                                type="button"
                                className={cls(
                                    "admin-pagination__page",
                                    item === page && "is-active",
                                )}
                                onClick={() => onPageChange(item)}
                                aria-current={item === page ? "page" : undefined}
                            >
                                {item}
                            </button>
                        </span>
                    ))}

                    <button
                        type="button"
                        className="admin-pagination__page"
                        disabled={!hasNext}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Next page"
                    >
                        <Icon name="chevronRight" size={15} />
                    </button>
                </div>
            ) : null}
        </div>
    )
}

export { Pagination }
export default Pagination

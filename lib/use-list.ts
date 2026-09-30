"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { LIST_PAGE_SIZE } from "@/lib/constants"
import type { Pagination } from "@/types"

export type ListQuery = {
    page: number
    limit: number
    search: string
    sort: string
    [key: string]: string | number
}

type ListResult<T> = {
    items: T[]
    pagination?: Pagination
}

/** Every list endpoint answers `{ <listKey>: [...], pagination }`. */
type RawList = { pagination?: Pagination } & Record<string, unknown>

/**
 * Shared state for every paginated list screen: SWR key building, search,
 * filters and page changes (any filter change resets to page 1).
 */
const useList = <T,>({
    path,
    listKey,
    sort = "-createdAt",
    filters = {},
}: {
    path: string
    listKey: string
    sort?: string
    filters?: Record<string, string>
}) => {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(LIST_PAGE_SIZE)
    const [active, setActive] = useState<Record<string, string>>(filters)

    const query = useMemo<ListQuery>(
        () => ({ page, limit, search, sort, ...active }),
        [page, limit, search, sort, active],
    )

    const { data, error, isLoading, isValidating, mutate } = useSWR<RawList>([path, query])

    const raw = data?.[listKey]
    const items = (Array.isArray(raw) ? raw : []) as T[]

    const changeFilter = (key: string, value: string) => {
        setActive(current => ({ ...current, [key]: value }))
        setPage(1)
    }

    const changeSearch = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    return {
        items,
        pagination: data?.pagination,
        query,
        search,
        setSearch: changeSearch,
        page,
        setPage,
        limit,
        setLimit: (value: number) => {
            setLimit(value)
            setPage(1)
        },
        active,
        changeFilter,
        error,
        isLoading,
        isValidating,
        refresh: mutate,
    }
}

export { useList }
export default useList

import cls from "classnames"

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cls("admin-skeleton", className)} aria-hidden="true" />
)

/** Matches the shape of the CRUD tables while the first request is in flight. */
const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
    <div className="p-4">
        <div className="admin-stack" style={{ gap: "0.75rem" }}>
            {Array.from({ length: rows }).map((_, index) => (
                <div className="admin-row" key={index} style={{ gap: "0.9rem" }}>
                    <Skeleton className="h-11 w-11 rounded-[12px]" />
                    <div className="flex-1" style={{ display: "grid", gap: "0.4rem" }}>
                        <Skeleton className="h-3.5 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="hidden h-8 w-24 sm:block" />
                </div>
            ))}
        </div>
    </div>
)

const StatSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="admin-grid admin-grid--stats">
        {Array.from({ length: count }).map((_, index) => (
            <div className="admin-card admin-stat" key={index}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        ))}
    </div>
)

export { Skeleton, TableSkeleton, StatSkeleton }
export default Skeleton

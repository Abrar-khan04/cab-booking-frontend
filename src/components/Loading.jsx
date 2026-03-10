export function PageLoader() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-amber-400/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
                </div>
                <span className="text-amber-400 text-sm font-semibold animate-pulse">Loading...</span>
            </div>
        </div>
    )
}

export function SkeletonCard({ rows = 3 }) {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded-full w-1/3 mb-2"></div>
                    <div className="h-2 bg-white/5 rounded-full w-1/2"></div>
                </div>
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={`h-2.5 bg-white/5 rounded-full mb-2 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`}></div>
            ))}
        </div>
    )
}

export function SkeletonList({ count = 3, rows = 2 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} rows={rows} />
            ))}
        </div>
    )
}

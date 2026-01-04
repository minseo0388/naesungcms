import { Skeleton } from "../../components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-10">
            <section className="text-center py-10 space-y-4">
                <Skeleton className="h-12 w-[300px] mx-auto" />
                <Skeleton className="h-6 w-[500px] mx-auto" />
            </section>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

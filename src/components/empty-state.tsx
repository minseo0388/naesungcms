import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileTextIcon, PlusIcon } from "@radix-ui/react-icons" // Or Lucide

interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
    return (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    {icon || <FileTextIcon className="h-10 w-10 text-muted-foreground" />}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
                {actionLabel && actionHref && (
                    <Button asChild>
                        <Link href={actionHref}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            {actionLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}

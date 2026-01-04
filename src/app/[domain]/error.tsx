"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground">
                    Don't worry, it's not you. It's us. We encountered an unexpected error.
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
            </div>
        </div>
    )
}

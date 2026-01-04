"use client"

import { useEffect, useState } from "react"
import { incrementView } from "@/actions/view"
import { Eye } from "lucide-react"

export function ViewCounter({ postId, initialViews }: { postId: string, initialViews: number }) {
    const [views, setViews] = useState(initialViews)
    const [hasViewed, setHasViewed] = useState(false)

    useEffect(() => {
        // Check session storage to avoid duplicate counts in single session
        const key = `viewed-${postId}`
        if (sessionStorage.getItem(key)) {
            setHasViewed(true)
            return
        }

        incrementView(postId)
        setViews(v => v + 1)
        sessionStorage.setItem(key, "true")
        setHasViewed(true)
    }, [postId])

    return (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{views.toLocaleString()} views</span>
        </div>
    )
}

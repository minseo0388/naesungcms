"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircledIcon, CircleIcon } from "@radix-ui/react-icons"

export function Onboarding({ hasPosts }: { hasPosts: boolean }) {
    if (hasPosts) return null // Hide if active

    return (
        <Card className="bg-muted/50 border-dashed">
            <CardHeader>
                <CardTitle>Welcome to NaesungCMS! 🚀</CardTitle>
                <CardDescription>Let's get your started with your first blog.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                    <CheckCircledIcon className="h-4 w-4 text-green-500" />
                    <span className="line-through text-muted-foreground">Sign up account</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <CheckCircledIcon className="h-4 w-4 text-green-500" />
                    <span className="line-through text-muted-foreground">Create your first blog</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <CircleIcon className="h-4 w-4 text-primary animate-pulse" />
                    <span>Write your first post</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CircleIcon className="h-4 w-4" />
                    <span>Customize your theme</span>
                </div>
            </CardContent>
        </Card>
    )
}

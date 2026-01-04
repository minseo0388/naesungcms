"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateUserName, deleteUser } from "@/actions/user"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function ProfileForm({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleUpdate(formData: FormData) {
        startTransition(async () => {
            const res = await updateUserName(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Profile updated")
                router.refresh()
            }
        })
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete your account? This action is IRREVERSIBLE. All your blogs and posts will be deleted permanently.")) {
            startTransition(async () => {
                await deleteUser()
                // Redirect is handled in action
            })
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your public profile information.</CardDescription>
                </CardHeader>
                <form action={handleUpdate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input name="name" defaultValue={user.name || ""} placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input disabled value={user.email || ""} />
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card border-destructive>
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all of your content.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "Deleting..." : "Delete Account"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

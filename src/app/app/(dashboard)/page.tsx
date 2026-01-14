import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserBlogs } from "@/actions/blog"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
    const blogs = await getUserBlogs()

    if (blogs.length > 0) {
        redirect(`/dashboard/${blogs[0].id}`)
    }

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
            <h1 className="text-2xl font-bold">Welcome to your CMS</h1>
            <p className="text-muted-foreground">You don't have any blogs yet.</p>
            <Button asChild>
                <Link href="/dashboard/new-blog">Create your first blog</Link>
            </Button>
        </div>
    )
}

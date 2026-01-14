import Link from "next/link"
import { getBlogPosts } from "@/actions/post"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default async function PostsPage({
    params,
}: {
    params: { blogId: string }
}) {
    const posts = await getBlogPosts(params.blogId)

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
                    <p className="text-muted-foreground">Manage your blog posts.</p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/${params.blogId}/posts/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Post
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.published ? "default" : "secondary"}>
                                            {post.published ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{post.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/${params.blogId}/posts/${post.id}/edit`}>Edit</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogBySubdomain, getPostsByBlogId } from "@/lib/fetchers"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/empty-state"

export default async function TenantHomePage({
    params,
}: {
    params: { domain: string }
}) {
    const subdomain = params.domain
    // Resolve Tenant again (cached request)
    const blog = await getBlogBySubdomain(subdomain)

    if (!blog) {
        notFound()
    }

    const posts = await getPostsByBlogId(blog.id)

    // Parse Theme Config
    let layout = "grid"
    try {
        if (blog.themeConfig) {
            const config = JSON.parse(blog.themeConfig)
            if (config.layout) layout = config.layout
        }
    } catch { }

    return (
        <div className="space-y-10">
            <section className="text-center py-10 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{blog.name}</h1>
                <p className="text-xl text-muted-foreground">
                    {blog.description || "A multi-tenant blog powered by NaesungCMS."}
                </p>
            </section>

            <div className={
                layout === 'list'
                    ? "flex flex-col space-y-6 max-w-2xl mx-auto"
                    : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            }>
                {posts.map((post: any) => (
                    <Card key={post.id} className={`flex ${layout === 'list' ? 'flex-row items-center space-y-0 p-4' : 'flex-col'}`}>
                        {/* In List mode, maybe hide image or show small thumbnail on left */}
                        <CardHeader className={`${layout === 'list' ? 'p-0 flex-1' : ''}`}>
                            <CardTitle className={`line-clamp-2 ${layout === 'list' ? 'text-xl' : ''}`}>
                                <Link href={`/posts/${post.slug}`} className="hover:underline">
                                    {post.title}
                                </Link>
                            </CardTitle>
                            {layout !== 'list' && (
                                <CardDescription className="line-clamp-3 mt-2">
                                    {post.content.slice(0, 150)}...
                                </CardDescription>
                            )}
                        </CardHeader>

                        {(layout === 'list') && (
                            <div className="ml-4 text-sm text-muted-foreground whitespace-nowrap">
                                <time dateTime={post.createdAt.toISOString()}>
                                    {post.createdAt.toLocaleDateString()}
                                </time>
                            </div>
                        )}

                        {layout !== 'list' && (
                            <>
                                <CardContent className="flex-1" />
                                <CardFooter className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={post.author.image || ""} />
                                        <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span>{post.author.name}</span>
                                    <span>•</span>
                                    <time dateTime={post.createdAt.toISOString()}>
                                        {post.createdAt.toLocaleDateString()}
                                    </time>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                ))}
                {posts.length === 0 && (
                    <div className="col-span-full py-10">
                        <EmptyState
                            title="No posts yet"
                            description="This blog hasn't published any content yet. Stay tuned!"
                            icon={null} // Default icon
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

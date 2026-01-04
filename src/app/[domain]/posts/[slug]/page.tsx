import { notFound } from "next/navigation"
import { getBlogBySubdomain, getPostBySlug } from "@/lib/fetchers"
import { Metadata } from "next"
import { ViewCounter } from "@/components/tenant/view-counter"

export async function generateMetadata({
    params,
}: {
    params: { domain: string; slug: string }
}): Promise<Metadata> {
    const subdomain = params.domain
    const blog = await getBlogBySubdomain(subdomain)

    if (!blog) return {}

    const post = await getPostBySlug(blog.id, params.slug)

    if (!post) return {}

    return {
        title: post.title,
        description: post.content.slice(0, 160), // Simple meta description
        openGraph: {
            title: post.title,
            description: post.content.slice(0, 160),
            type: "article",
            publishedTime: post.createdAt.toISOString(),
            authors: [post.author.name || ""],
        }
    }
}

export default async function PostPage({
    params,
}: {
    params: { domain: string; slug: string }
}) {
    const subdomain = params.domain
    const blog = await getBlogBySubdomain(subdomain)

    if (!blog) {
        notFound()
    }

    const post = await getPostBySlug(blog.id, params.slug)

    if (!post) {
        notFound()
    }

    return (
        <article className="max-w-3xl mx-auto py-10">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{post.title}</h1>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <span>{post.author.name}</span>
                        <span>•</span>
                        <time dateTime={post.createdAt.toISOString()}>
                            {post.createdAt.toLocaleDateString()}
                        </time>
                    </div>
                    <ViewCounter postId={post.id} initialViews={post.viewCount || 0} />
                </div>
            </header>

            <div className="prose prose-slate lg:prose-lg mx-auto">
                {/* Basic rendering. In real app, use a markdown parser */}
                {post.content.split("\n").map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                ))}
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        datePublished: post.createdAt.toISOString(),
                        dateModified: post.createdAt.toISOString(), // Should use updatedAt if available
                        description: post.content.slice(0, 160),
                        author: {
                            "@type": "Person",
                            name: post.author.name,
                        },
                    }),
                }}
            />
        </article>
    )
}

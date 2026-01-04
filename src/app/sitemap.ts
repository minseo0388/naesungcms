import { getBlogBySubdomain, getPostsByBlogId } from "@/lib/fetchers"
import { MetadataRoute } from "next"
import { headers } from "next/headers"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const headersList = await headers()
    const host = headersList.get("host") || ""
    const protocol = host.includes("localhost") ? "http" : "https"

    // 1. Identify Tenant
    const blog = await getBlogBySubdomain(host)

    if (!blog) {
        // Fallback for main domain or 404
        return [
            {
                url: `${protocol}://${host}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ]
    }

    // 2. Fetch Posts
    const posts = await getPostsByBlogId(blog.id)

    // 3. Build Sitemap
    const postUrls = posts.map((post: any) => ({
        url: `${protocol}://${host}/posts/${post.slug}`,
        lastModified: new Date(post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: `${protocol}://${host}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postUrls,
    ]
}

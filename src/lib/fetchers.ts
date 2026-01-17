import { cache } from "react"
import prisma from "@/lib/db"
import { redis } from "@/lib/redis"

// Cache based on arguments. Good for per-request caching in Next.js App Router.

export const getBlogBySubdomain = cache(async (subdomain: string) => {
    // DEBUG: Trace undefined subdomain
    if (!subdomain) {
        console.error("DEBUG: getBlogBySubdomain called with undefined/empty subdomain");
        // console.trace();
        return null;
    }
    // 1. Try Redis
    if (redis) {
        try {
            const cached = await redis.get<any>(`blog:${subdomain}`)
            if (cached) return cached
        } catch (e) {
            console.error("Redis Error (Fallback to DB):", e)
        }
    }

    // 2. Fetch DB
    const blog = await prisma.blog.findUnique({
        where: {
            subdomain,
        },
    })

    // 3. Set Redis
    if (redis && blog) {
        try {
            await redis.set(`blog:${subdomain}`, blog, { ex: 60 }) // 60s cache
        } catch (e) {
            console.error("Redis Write Error:", e)
        }
    }

    return blog
})

export const getPostsByBlogId = cache(async (blogId: string) => {
    if (redis) {
        try {
            const cached = await redis.get<any[]>(`posts:${blogId}`)
            if (cached) {
                // Revive Dates
                return cached.map(p => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt)
                }))
            }
        } catch (e) {
            console.error("Redis Error (Fallback to DB):", e)
        }
    }

    const posts = await prisma.post.findMany({
        where: {
            blogId,
            published: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    })

    if (redis && posts.length > 0) {
        try {
            await redis.set(`posts:${blogId}`, posts, { ex: 60 })
        } catch (e) {
            console.error("Redis Write Error:", e)
        }
    }

    return posts
})

export const getPostBySlug = cache(async (blogId: string, slug: string) => {
    // Basic caching for individual post can be added similarly
    // For brevity, left as DB call or similar pattern
    return await prisma.post.findFirst({
        where: {
            blogId,
            slug,
            published: true,
        },
        include: {
            author: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    })
})

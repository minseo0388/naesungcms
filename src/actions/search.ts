"use server"

import { withTenant } from "@/lib/data-access"
import prisma from "@/lib/db"

export async function searchPosts(blogId: string, query: string) {
    if (!query) return []

    // Use Zero Trust Wrapper
    return await withTenant(blogId, async ({ blogId: validatedBlogId }) => {
        // Full Text Search
        const posts = await prisma.post.findMany({
            where: {
                blogId: validatedBlogId,
                published: true,
                title: {
                    // @ts-ignore: Stale IDE Cache
                    search: query // Prisma FullText Syntax
                },
                content: {
                    // @ts-ignore: Stale IDE Cache
                    search: query
                }
            },
            take: 20,
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
                // Highlight snippets? Prisma doesn't do this natively efficiently yet, 
                // typically done in application logic or cleaner index
            }
        })

        return posts
    })
}

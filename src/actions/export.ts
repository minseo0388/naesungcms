"use server"

import { withTenant } from "@/lib/data-access"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"

export async function exportBlogData(blogId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    return await withTenant(blogId, async ({ blogId: validatedId }) => {
        // Ownership check
        const blog = await prisma.blog.findUnique({
            where: { id: validatedId, ownerId: session.user.id }
        })
        if (!blog) throw new Error("Unauthorized Access")

        // Fetch Data
        const posts = await prisma.post.findMany({
            where: { blogId: validatedId },

        })

        // Serialize
        const exportData = {
            blog: {
                name: blog.name,
                subdomain: blog.subdomain,
                description: blog.description,
                createdAt: blog.createdAt,
            },
            posts: posts.map(p => ({
                title: p.title,
                slug: p.slug,
                content: p.content,
                published: p.published,
                createdAt: p.createdAt,
            }))
        }

        return JSON.stringify(exportData, null, 2)
    })
}

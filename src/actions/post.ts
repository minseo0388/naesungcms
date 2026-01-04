"use server"

import { withTenant } from "@/lib/data-access"
import { deleteFile } from "@/lib/storage"


import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { createPostSchema, CreatePostInput } from "@/lib/validations/schemas"
import { revalidatePath } from "next/cache"

import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

// Extend schema if needed to include blogId, or pass it separately.
// For SafeAction, it's best to have a single input object.
const createPostWithBlogSchema = createPostSchema.extend({
    blogId: z.string()
})

export const createPost = createSafeAction(
    createPostWithBlogSchema,
    async (data, ctx) => {
        const { blogId, slug: providedSlug, title, content, published } = data

        // Verify ownership (Business Logic)
        const blog = await prisma.blog.findUnique({
            where: {
                id: blogId,
                ownerId: ctx.userId,
            },
        })

        if (!blog) {
            throw new Error("Blog not found or unauthorized")
        }

        // Generate slug
        let slug = providedSlug
        if (!slug) {
            slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
        }

        const existingPost = await prisma.post.findFirst({
            where: { blogId, slug }
        })

        if (existingPost) {
            slug = `${slug}-${Date.now()}`
        }

        const post = await prisma.post.create({
            data: {
                title, content, slug: slug!, published, blogId, authorId: ctx.userId
            }
        })

        // Audit Log (Success)
        try {
            // @ts-ignore: Stale IDE Cache
            await prisma.auditLog.create({
                data: {
                    userId: ctx.userId,
                    action: "CREATE_POST",
                    resource: "Post",
                    details: `Created post: ${post.title} (${post.id})`
                }
            })
        } catch { }

        revalidatePath(`/dashboard/${blogId}/posts`)
        return post
    },
    { actionName: "createPost", limit: 10 }
)


export async function getBlogPosts(blogId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    // Use Zero Trust Wrapper
    return await withTenant(blogId, async ({ blogId: validatedBlogId }) => {
        const blog = await prisma.blog.findUnique({
            where: {
                id: validatedBlogId,
                ownerId: session.user.id
            }
        })

        if (!blog) return []

        return await prisma.post.findMany({
            where: {
                blogId: validatedBlogId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        })
    })
}

// Update Post + Revisions
const updatePostSchema = createPostSchema.extend({
    id: z.string(),
    blogId: z.string()
})

export const updatePost = createSafeAction(
    updatePostSchema,
    async (data, ctx) => {
        const { id, blogId, title, content, published, slug } = data

        // Verify Ownership
        const post = await prisma.post.findUnique({
            where: { id },
            select: { id: true, title: true, content: true, blogId: true } // Fetch OLD content
        })

        if (!post || post.blogId !== blogId) {
            throw new Error("Post not found")
        }

        // Check permissions (User must own blog of this post)
        // We can double check Blog ownership, or trust that only Owner has access to Dashboard.
        // Better to check Blog ownership.
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        // 1. Resource Management: Detect Deleted Images
        // 1. Resource Management: Detect Deleted Images
        // Helper to extract keys (Universal: work for S3 and Local)
        const extractKeys = (html: string) => {
            const keys = new Set<string>()

            // S3 Pattern
            const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
            // Local Pattern
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            const localUrl = `${appUrl}/uploads/`

            // Find S3 keys
            const s3Regex = new RegExp(bucketUrl + "([^\"'\\s]+)", "g")
            let match;
            while ((match = s3Regex.exec(html)) !== null) {
                keys.add(match[1])
            }

            // Find Local keys
            const localRegex = new RegExp(localUrl + "([^\"'\\s]+)", "g")
            while ((match = localRegex.exec(html)) !== null) {
                keys.add(match[1])
            }

            return keys
        }

        const oldKeys = extractKeys(post.content)
        const newKeys = extractKeys(content)

        // Find keys present in OLD but NOT in NEW
        const keysToDelete = Array.from(oldKeys).filter(key => !newKeys.has(key))

        if (keysToDelete.length > 0) {
            console.log(`[Cleanup] Found ${keysToDelete.length} orphaned images. Deleting...`)
            // Async delete (fire and forget to not block UI)
            Promise.all(keysToDelete.map(key => deleteFile(key).catch(err => console.error(err))))
        }


        // 1. Create Revision (Save OLD state)
        // @ts-ignore: Stale IDE Cache for PostRevision
        await prisma.postRevision.create({
            data: {
                postId: post.id,
                title: post.title,
                content: post.content
            }
        })

        // 2. Update Post
        const updated = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                published,
                slug // Optional update
            }
        })

        revalidatePath(`/dashboard/${blogId}/posts`)
        return updated
    },
    { actionName: "updatePost" }
)

"use server"

import prisma from "@/lib/db"
import { createCategorySchema, createTagSchema } from "@/lib/validations/schemas"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// --- Categories ---

export const createCategory = createSafeAction(
    createCategorySchema,
    async (data, ctx) => {
        const { name, slug: providedSlug, description, parentId, blogId } = data

        // Verify ownership
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        let slug = providedSlug
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug: slug!,
                description,
                parentId,
                blogId
            }
        })

        revalidatePath(`/dashboard/${blogId}/settings`)
        return category
    },
    { actionName: "createCategory" }
)

export const deleteCategory = createSafeAction(
    z.object({ id: z.string(), blogId: z.string() }),
    async (data, ctx) => {
        const { id, blogId } = data
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        await prisma.category.delete({
            where: { id }
        })

        revalidatePath(`/dashboard/${blogId}/settings`)
        return { success: true }
    },
    { actionName: "deleteCategory" }
)

// --- Tags ---

// Tags are often created on the fly in Post editor, but explicit management is good too
export const createTag = createSafeAction(
    createTagSchema,
    async (data, ctx) => {
        const { name, slug: providedSlug, blogId } = data

        // Verify ownership
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        let slug = providedSlug
        if (!slug) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                slug: slug!,
                blogId
            }
        })

        return tag
    },
    { actionName: "createTag" }
)

export const deleteTag = createSafeAction(
    z.object({ id: z.string(), blogId: z.string() }),
    async (data, ctx) => {
        const { id, blogId } = data
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        await prisma.tag.delete({
            where: { id }
        })

        return { success: true }
    },
    { actionName: "deleteTag" }
)

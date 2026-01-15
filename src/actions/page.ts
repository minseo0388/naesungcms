"use server"

import prisma from "@/lib/db"
import { createPageSchema } from "@/lib/validations/schemas"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"
import { revalidatePath } from "next/cache"

export const createPage = createSafeAction(
    createPageSchema,
    async (data, ctx) => {
        const { title, content, slug: providedSlug, published, metaDescription, ogImage, blogId } = data

        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        let slug = providedSlug
        if (!slug) {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        }

        const page = await prisma.page.create({
            data: {
                title,
                content,
                slug: slug!,
                published,
                metaDescription,
                ogImage,
                blogId
            }
        })

        revalidatePath(`/dashboard/${blogId}/pages`)
        return page
    },
    { actionName: "createPage" }
)

export const updatePage = createSafeAction(
    createPageSchema.extend({ id: z.string() }),
    async (data, ctx) => {
        const { id, title, content, slug, published, metaDescription, ogImage, blogId } = data

        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        const page = await prisma.page.update({
            where: { id },
            data: {
                title, content, slug, published, metaDescription, ogImage
            }
        })

        revalidatePath(`/dashboard/${blogId}/pages`)
        return page
    },
    { actionName: "updatePage" }
)

export const deletePage = createSafeAction(
    z.object({ id: z.string(), blogId: z.string() }),
    async (data, ctx) => {
        const { id, blogId } = data
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: ctx.userId }
        })
        if (!blog) throw new Error("Unauthorized")

        await prisma.page.delete({ where: { id } })
        revalidatePath(`/dashboard/${blogId}/pages`)
        return { success: true }
    },
    { actionName: "deletePage" }
)

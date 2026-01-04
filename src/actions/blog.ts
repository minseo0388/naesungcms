"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { createBlogSchema, CreateBlogInput } from "@/lib/validations/schemas"
import { revalidatePath } from "next/cache"

export async function createBlog(data: CreateBlogInput) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized",
        }
    }

    const result = createBlogSchema.safeParse(data)

    if (!result.success) {
        return {
            error: "Invalid input",
            details: result.error.flatten(),
        }
    }

    const { name, subdomain } = result.data

    try {
        const existingBlog = await prisma.blog.findUnique({
            where: {
                subdomain,
            },
        })

        if (existingBlog) {
            return {
                error: "Subdomain already taken",
            }
        }

        const blog = await prisma.blog.create({
            data: {
                name,
                subdomain,
                ownerId: session.user.id,
            },
        })

        revalidatePath("/dashboard")
        return {
            success: true,
            blog,
        }
    } catch (error) {
        console.error("Create Blog Error:", error)
        return {
            error: "Failed to create blog",
        }
    }
}

export async function getUserBlogs() {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    return await prisma.blog.findMany({
        where: {
            ownerId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

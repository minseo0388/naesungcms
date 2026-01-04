"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateUserName(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string

    if (!name || name.length < 3) {
        return { error: "Name must be at least 3 characters" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name }
        })
        revalidatePath("/account")
        return { success: "Profile updated" }
    } catch (e) {
        return { error: "Failed to update profile" }
    }
}

export async function deleteUser() {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        // 1. Fetch user blogs to clean up S3
        const userBlogs = await prisma.blog.findMany({
            where: { ownerId: session.user.id },
            select: { id: true }
        })

        // 2. Cleanup S3 Assets (Stub)
        // In production, you would iterate userBlogs and delete `tenants/${blog.id}` folder in S3.
        // await Promise.all(userBlogs.map(blog => deleteS3Folder(`tenants/${blog.id}`)))

        console.log(`[Account Deletion] Cleaning up assets for blogs: ${userBlogs.map(b => b.id).join(", ")}`)

        // 3. Delete User (Cascade will remove Blogs, Posts, Comments, etc.)
        await prisma.user.delete({
            where: { id: session.user.id }
        })

    } catch (e) {
        console.error(e)
        return { error: "Failed to delete account" }
    }

    redirect("/")
}

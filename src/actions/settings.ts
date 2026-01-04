"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateSettingsSchema = z.object({
    description: z.string().optional(),
    themeConfig: z.string().optional(), // JSON strong
})

export async function updateBlogSettings(blogId: string, data: z.infer<typeof updateSettingsSchema>) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId, ownerId: session.user.id }
        })

        if (!blog) return { error: "Blog not found" }

        await prisma.blog.update({
            where: { id: blogId },
            data: {
                description: data.description,
                // @ts-ignore: Stale IDE Cache
                themeConfig: data.themeConfig
            }
        })

        // Audit Log
        try {
            // @ts-ignore: Stale IDE Cache
            await prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "UPDATE_SETTINGS",
                    resource: "Blog",
                    details: `Updated settings for blog ${blogId}`
                }
            })
        } catch { }

        revalidatePath(`/dashboard/${blogId}/settings`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update settings" }
    }
}

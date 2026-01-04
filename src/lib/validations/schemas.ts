import { z } from "zod"

export const createBlogSchema = z.object({
    name: z.string().min(1, "Blog name is required").max(50),
    subdomain: z
        .string()
        .min(3, "Subdomain must be at least 3 characters")
        .max(20)
        .regex(/^[a-z0-9-]+$/, "Subdomain must contain only lowercase letters, numbers, and hyphens"),
})

export type CreateBlogInput = z.infer<typeof createBlogSchema>

export const createPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string().min(1, "Content is required"),
    slug: z.string().optional(), // If not provided, will be generated
    published: z.boolean().default(false),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

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
    // SEO
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),
    // Taxonomy
    categoryId: z.string().optional(),
    tags: z.array(z.string()).optional() // Array of tag names
})

export type CreatePostInput = z.infer<typeof createPostSchema>

export const createPageSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string(),
    slug: z.string().optional(),
    published: z.boolean().default(false),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
    blogId: z.string()
})

export const createCategorySchema = z.object({
    name: z.string().min(1).max(50),
    slug: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    blogId: z.string()
})

export const createTagSchema = z.object({
    name: z.string().min(1).max(50),
    slug: z.string().optional(),
    blogId: z.string()
})

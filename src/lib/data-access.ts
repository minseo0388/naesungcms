import prisma from "@/lib/db"

/**
 * Executes a callback with a strictly scoped Prisma delegate.
 * This simulates a "Zero Trust" environment where we cannot accidentally access another tenant's data.
 * 
 * @param blogId The Tenant ID to lock scope to
 * @param callback Function to execute with the scoped context
 */
export async function withTenant<T>(blogId: string, callback: (tenantContext: { blogId: string }) => Promise<T>) {
    // In a real "Zero Trust" wrapper, we would wrap the prisma client itself to inject filters.
    // For this implementation, we provide the verified blogId to be used in queries.
    // Future expansion: Return a wrapped Prisma client that throws if 'where: { blogId }' is missing.

    // 1. Verify Tenant Existence (Optional, maybe cache this)
    const exists = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true } })
    if (!exists) throw new Error("Tenant not found")

    // 2. Execute
    return callback({ blogId })
}

// Example usage helper
export const tenantFilter = (blogId: string) => ({ blogId })

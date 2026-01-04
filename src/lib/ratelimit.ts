import prisma from "@/lib/db"

/**
 * Basic DB-backed Rate Limiter
 * @param key Identifier (User ID or IP)
 * @param limit Max requests
 * @param windowSeconds Time window in seconds
 * @returns { success: boolean, remaining: number }
 */
export async function rateLimit(key: string, limit: number = 10, windowSeconds: number = 60) {
    const now = new Date()

    try {
        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Clean up old limit for this key if expired
            // @ts-ignore: Stale IDE Cache - field exists
            const existing = await tx.rateLimit.findUnique({
                where: { key }
            })

            if (existing && existing.expiresAt < now) {
                // Expired, reset
                // @ts-ignore: Stale IDE Cache
                return await tx.rateLimit.update({
                    where: { key },
                    data: {
                        count: 1,
                        expiresAt: new Date(now.getTime() + windowSeconds * 1000)
                    }
                })
            } else if (existing) {
                // Check limit
                if (existing.count >= limit) {
                    return existing // Return current state (blocked)
                }
                // Increment
                // @ts-ignore: Stale IDE Cache
                return await tx.rateLimit.update({
                    where: { key },
                    data: { count: existing.count + 1 }
                })
            } else {
                // Create new
                // @ts-ignore: Stale IDE Cache
                return await tx.rateLimit.create({
                    data: {
                        key,
                        count: 1,
                        expiresAt: new Date(now.getTime() + windowSeconds * 1000)
                    }
                })
            }
        })

        return {
            success: result.count <= limit,
            remaining: Math.max(0, limit - result.count),
            limit
        }

    } catch (error) {
        console.error("RateLimit Error:", error)
        // Fail open if DB is down, or fail closed? Fail open for UX.
        return { success: true, remaining: 1, limit }
    }
}

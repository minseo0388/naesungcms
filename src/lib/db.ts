import { PrismaClient } from "@prisma/client"
import "@/env" // Trigger validation

const prismaClientSingleton = () => {
    const client = new PrismaClient()

    // Extend client for logging (Optional: Use $extends if on newer Prisma features properly configured)
    // For simplicity and compatibility, we use standard middleware for logging
    client.$use(async (params, next) => {
        const before = Date.now()
        const result = await next(params)
        const after = Date.now()
        const duration = after - before

        if (duration > 1000) {
            console.warn(`[SLOW QUERY] ${params.model}.${params.action} took ${duration}ms`)
        }

        return result
    })

    return client
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
